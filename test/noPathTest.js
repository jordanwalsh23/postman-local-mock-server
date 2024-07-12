const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3561;

var options = {
  port: PORT,
  debug: true
}

let server

describe('Postman Local Mock Server Tests', () => {
  beforeEach(() => {
    options.collection = JSON.parse(
      fs.readFileSync('./test/collections/test-collection-no-path.json', 'utf8')
    )

    server = new PostmanLocalMockServer(options)
    server.start()
  })

  describe('Get with no path', () => {
    it('Default GET response test with no path', async () => {
      return await axios.get(`http://localhost:${PORT}`).then(res => {
        assert(res.data.status === 'OK')
      })
    })
  })

  afterEach(() => {
    server.stop()
  })
});