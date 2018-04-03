const _ = require('lodash')
const Ajv = require('ajv')
const defaults = { useDefaults: true, coerceTypes: true }
const ajvCache = {}

const __validate = (ajvOptions = {}) => {
  let options = _.assign({}, defaults, ajvOptions)

  let key = JSON.stringify(options)
  let cached = ajvCache[key]
  if (cached) {
    return cached
  }
  const ajv = new Ajv(options)

  ajv.addFormat('objectid', /^[a-z0-9]{24}$/)

  ajvCache[key] = ajv
  return ajv
}

const pickFieldFromErrors = errors => {
  // 属性错误时，会有可能触发多个规则，故会产生重复，使用`_.uniq`去重
  return _.uniq(
    errors.map(ele => {
      if (ele.keyword === 'required') {
        return ele.params.missingProperty
      }
      return ele.dataPath.substr(1)
    })
  )
}

module.exports = (schema, data) => {
  let schemaCopied = _.clone(schema)
  let { ajvOptions } = schemaCopied
  delete schemaCopied.ajvOptions
  const ajv = __validate(ajvOptions)
  let validator = ajv.compile(schemaCopied)
  let isValid = validator(data)
  let err
  if (!isValid) {
    let fields = pickFieldFromErrors(validator.errors).join(',')
    err = new Error(`Invalid parameters: ${fields}`)
  }
  return err
}
