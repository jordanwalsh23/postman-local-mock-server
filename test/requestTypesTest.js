const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3555;

var options = {
  port: PORT,
  debug: true
}

let server;

describe('Different Request Types', () => {
  before(() => {
    options.collection = JSON.parse(
      fs.readFileSync('./test/collections/all-request-types.json', 'utf8')
    )
    
    server = new PostmanLocalMockServer(options)
    server.start()
  })

  it('Success GET response test.', async () => {
    return await axios.get(`http://localhost:${PORT}/get`).then(res => {
      assert(res.data.url === 'https://postman-echo.com/get')
    })
  })

  it('Success POST response test.', async () => {
    return await axios
      .post(
        `http://localhost:${PORT}/post`,
        {
          "status": true
        },
        {
          headers: {
            'x-mock-match-request-body': 'true',
            'content-type': 'application/json'
          }
        }
      )
      .then(res => res.data)
      .then(res => {
        assert(res.data.status === true)
        assert(res.url === 'https://postman-echo.com/post')
      })
  })

  it('Success PUT response test.', async () => {
    return await axios
      .put(
        `http://localhost:${PORT}/put`,
        {
          "status": true
        },
        {
          headers: {
            'x-mock-match-request-body': 'true',
            'content-type': 'application/json'
          }
        }
      )
      .then(res => res.data)
      .then(res => {
        assert(res.data.status === true)
        assert(res.url === 'https://postman-echo.com/put')
      })
  })

  it('Success DELETE response test.', async () => {
    return await axios.delete(`http://localhost:${PORT}/delete`).then(res => {
      assert(res.data.url === 'https://postman-echo.com/delete')
    })
  })

  it('Success HEAD response test.', async () => {
    return await axios.head(`http://localhost:${PORT}/head`).then(res => {
    assert(res.status === 200)
    })
  })

  it('Success OPTIONS response test.', async () => {
    return await axios.options(`http://localhost:${PORT}/options`).then(res => {
    assert(res.status === 200)
    })
  })


  after(() => {
    server.stop()
  })

});
