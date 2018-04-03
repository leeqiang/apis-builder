const pathProxy = require('path-proxy')
const promisifyCall = require('promisify-call')
const ajv = require('./ajv')
const _ = require('lodash')

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

    function impl (data, fn) {
      let requestPath = action.href
      const pathParams = action.href.match(/{[^}]+}/g) || []

      if (typeof data === 'function') {
        fn = data
        data = undefined
      }

      let err
      if (this.params.length !== pathParams.length) {
        err = new Error(`Invalid number of params in path (expected ${pathParams.length}, got ${this.params.length}).`)
        return fn(err)
      }

      this.params.forEach((param) => {
        requestPath = requestPath.replace(/{[^}]+}/, param)
      })

      let schema = { properties }
      if (action.required) { schema.required = action.required }
      err = ajv(schema, data)
      if (err) {
        return fn(err)
      }

      this.client = this.base
      if (typeof this.client[action.method.toLowerCase()] !== 'function') {
        console.error(`WARNING: 'this.client.${action.method.toLowerCase()}' is not a function`)
        return
      }
      return this.client[action.method.toLowerCase()](requestPath, data, fn)
    }

    function promisifed (data, fn) {
      return promisifyCall(this, impl, data, fn)
    }

    constructor.prototype[_.camelCase(actionName)] = promisifed
  }
}

function build (baseObj, resources) {
  const b = new Builder(baseObj, resources)

  b.build()
}

exports.build = build
