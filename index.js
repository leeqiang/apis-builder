const _ = require('lodash')
const ajv = require('./ajv')
const pathProxy = require('path-proxy')

class Builder {
  constructor (baseObj, resources) {
    this.baseObj = baseObj
    this.resources = resources
  }

  build () {
    Object.keys(this.resources).forEach((key) => {
      this.buildResource(this.resources[key])
    })
  }

  buildResource (resource) {
    resource.links && resource.links.forEach(this.buildAction, this)
  }

  buildAction (action) {
    const actionName = action.title
    const properties = action.properties

    // HACKY special case for members bulk add and send MIME endpoints
    const path = action.href.replace(/\.json/gi, '').replace(/\.mime/gi, '').replace(/:.*/g, '').replace(/\/path$/g, '/$path')
    const constructor = pathProxy.pathProxy(this.baseObj, path.toLowerCase())

    function impl (data) {
      let requestPath = action.href
      const pathParams = action.href.match(/{[^}]+}/g) || []

      let err
      if (this.params.length !== pathParams.length) {
        err = new Error(`Invalid number of params in path (expected ${pathParams.length}, got ${this.params.length}).`)
        throw err
      }

      this.params.forEach((param) => {
        requestPath = requestPath.replace(/{[^}]+}/, param)
      })

      let schema = { properties }
      if (action.required) { schema.required = action.required }
      err = ajv(schema, data)
      if (err) throw err

      this.client = this.base
      if (typeof this.client[action.method.toLowerCase()] !== 'function') {
        console.error(`WARNING: 'this.client.${action.method.toLowerCase()}' is not a function`)
        return
      }
      return this.client[action.method.toLowerCase()](requestPath, data)
    }

    constructor.prototype[_.camelCase(actionName)] = impl
  }
}

function build (baseObj, resources) {
  const b = new Builder(baseObj, resources)

  b.build()
}

exports.build = build
