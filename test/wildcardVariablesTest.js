const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3000;

var options = {
  port: PORT,
  debug: true
}

let server

describe('Postman Local Mock Server Tests', () => {
  beforeEach(() => {
    options.collection = JSON.parse(
      fs.readFileSync('./test/collections/wildcard-variables-test.json', 'utf8')
    )

    server = new PostmanLocalMockServer(options)
    server.start()
  })

  describe('Default request tests', () => {
    it('Default GET response test with a name', async () => {
      return await axios.get(`http://localhost:${PORT}/users/carol`).then(res => {
        assert(res.data.name === 'carol')
      })
    })

    it('Default GET response test.', async () => {
      return await axios.get(`http://localhost:${PORT}/users/john`).then(res => {
        assert(res.data.name === 'john')
      })
    })

    it('Default GET response test.', async () => {
      return await axios.get(`http://localhost:${PORT}/users/fred`).then(res => {
        assert(res.data.name === 'fred')
      })
    })
  })

  afterEach(() => {
    server.stop()
  })
});