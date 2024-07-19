const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3556;

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

  it('Default GET response with query param with 1 ids', async () => {
    return await axios.get(`http://localhost:${PORT}/users?page=1&limit=1&filters=company_id+eq+2&filters=id+in+(05ee1e2d-1a80-4384-9d65-3beb16bcfd1a)`).then(res => {
      assert(res.status, 200)
      assert.deepEqual(res.data, {
        metadata: {
          count: 1,
          page: 1,
          total_count: 1,
          total_page: 1
        },
        data: {
          ids: ["05ee1e2d-1a80-4384-9d65-3beb16bcfd1a"],
        }
      })
    })
  })

  it('Default GET response with query param with ids 9c366ded-4c52-43ed-ab73-db7566f28132 and 8810022b-1fe9-40fb-bd5b-cfb48beaa621', async () => {
    return await axios.get(`http://localhost:${PORT}/users?page=1&limit=2&filters=company_id+eq+2&filters=id+in+(9c366ded-4c52-43ed-ab73-db7566f28132+8810022b-1fe9-40fb-bd5b-cfb48beaa621)`).then(res => {
      assert(res.status, 200)
      assert.deepEqual(res.data, {
        metadata: {
          count: 2,
          page: 1,
          total_count: 2,
          total_page: 1
        },
        data: {
          ids: ["9c366ded-4c52-43ed-ab73-db7566f28132", "8810022b-1fe9-40fb-bd5b-cfb48beaa621"],
        }
      })
    })
  })

  it('Default GET response with query param with ids 05ee1e2d-1a80-4384-9d65-3beb16bcfd1a and 8810022b-1fe9-40fb-bd5b-cfb48beaa621', async () => {
    return await axios.get(`http://localhost:${PORT}/users?page=1&limit=2&filters=company_id+eq+2&filters=id+in+(05ee1e2d-1a80-4384-9d65-3beb16bcfd1a+8810022b-1fe9-40fb-bd5b-cfb48beaa621)`).then(res => {
      assert(res.status, 200)
      assert.deepEqual(res.data, {
        metadata: {
          count: 2,
          page: 1,
          total_count: 2,
          total_page: 1
        },
        data: {
          ids: ["05ee1e2d-1a80-4384-9d65-3beb16bcfd1a", "8810022b-1fe9-40fb-bd5b-cfb48beaa621"],
        }
      })
    })
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
