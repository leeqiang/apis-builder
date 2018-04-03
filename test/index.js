/* global describe, before, it */
const apisBuidler = require('../index')
const expect = require('expect')

const SDK = class SDK {}

describe('Apis Builder Testing', () => {
  before(() => {
    apisBuidler.build(SDK, {
      api: {
        links: [{
          description: '测试1',
          href: '/tests:a',
          method: 'GET',
          title: 'list'
        }, {
          description: '测试2',
          href: '/tests/{id}/hello:a',
          method: 'POST',
          title: 'say'
        }, {
          description: '测试3',
          href: '/tests/{id}/hello/path',
          method: 'POST',
          title: 'say'
        }, {
          description: '测试4',
          href: '/tests/{id}:a',
          method: 'GET',
          title: 'get-by-id'
        }, {
          description: '测试5: ajv',
          href: '/tests/{_id}:ajv',
          method: 'GET',
          title: 'ajv',
          properties: {
            _otherId: { type: 'string', format: 'objectid' }
          }
        }]
      }
    })
  })

  it('should ok', function (done) {
    let sdk = new SDK()
    expect(typeof sdk.tests === 'function').toBe(true)
    expect(typeof sdk.tests().list === 'function').toBe(true)
    done()
  })

  it('should ok with param', function (done) {
    let sdk = new SDK()
    expect(typeof sdk.tests('123').hello === 'function').toBe(true)
    expect(typeof sdk.tests('123').hello().say === 'function').toBe(true)
    done()
  })

  it('should ok with reverse word#path', function (done) {
    let sdk = new SDK()
    expect(typeof sdk.tests('123').hello().$path === 'function').toBe(true)
    done()
  })

  it('should ok get by id', function (done) {
    let sdk = new SDK()
    expect(typeof sdk.tests('123').getById === 'function').toBe(true)
    done()
  })

  it('should ok ajv', async function () {
    let sdk = new SDK()
    try {
      await sdk.tests('123').ajv({
        _otherId: '123'
      })
    } catch (err) {
      expect(err.message.includes('_otherId')).toBe(true)
    }
  })
})
