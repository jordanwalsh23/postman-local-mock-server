const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3555

let server

describe('Postman Local Mock Server Tests', () => {
  beforeEach(() => {
    let collection = JSON.parse(
      fs.readFileSync('./test/test-collection.json', 'utf8')
    )
    server = new PostmanLocalMockServer(PORT, collection)
    server.start()
  })

  describe('Default request tests', () => {
    it('Default GET response test.', async () => {
      return await axios.get(`http://localhost:${PORT}/get`).then(res => {
        assert(res.data.args.name === 'Jordan')
      })
    })

    it('x-mock-response-name test.', async () => {
      return await axios
        .get(`http://localhost:${PORT}/get`, {
          headers: {
            'x-mock-response-name': '200 Different Name'
          }
        })
        .then(res => {
          assert(res.data.args.name === 'Not Jordan')
        })
    })

    it('Faker Library Test', async () => {
      return await axios
        .get(`http://localhost:${PORT}/get`, {
          headers: {
            'x-mock-response-name': 'Faker Response'
          }
        })
        .then(res => {
          assert(JSON.stringify(res.data).match(/{{\$.+}}/g) === null)
        })
    })

    it('x-mock-response-code test.', async () => {
      return await axios
        .get(`http://localhost:${PORT}/get`, {
          headers: {
            'x-mock-response-code': 201
          }
        })
        .then(res => {
          assert(res.status === 201)
          assert(res.data.message === 'Item has been created.')
        })
    })
  })

  describe('POST request tests', () => {
    it('Default POST response test.', async () => {
      return await axios
        .post(`http://localhost:${PORT}/post`)
        .then(res => res.data)
        .then(res => {
          assert(res.data.number === 1)
          assert(res.data.text === 'Quick Brown Fox')
        })
    })

    it('POST response with different body.', async () => {
      return await axios
        .post(
          `http://localhost:${PORT}/post`,
          {
            number: 2,
            text: 'Jumped Over The'
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
          assert(res.data.number === 2)
          assert(res.data.text === 'Jumped Over The')
        })
    })

    it('POST response with specific response selected.', async () => {
      return await axios
        .post(
          `http://localhost:${PORT}/post`,
          {
            number: 2,
            text: 'Jumped Over The'
          },
          {
            headers: {
              'x-mock-response-name': 'Alternate Response 2',
              'content-type': 'application/json'
            }
          }
        )
        .then(res => res.data)
        .then(res => {
          assert(res.data.number === 2)
          assert(res.data.text === 'Jumped Over The')
        })
    })

    it('POST response with an unknown body.', async () => {
      return await axios
        .post(
          `http://localhost:${PORT}/post`,
          {
            number: 999,
            text: 'Fred'
          },
          {
            headers: {
              'x-mock-match-request-body': 'true',
              'content-type': 'application/json'
            }
          }
        )
        .catch(err => {
          assert(err.response.status === 404)
        })
    })
  })

  describe('multiple concurrent server tests', () => {
    const PORT1 = 5555
    const PORT2 = 5556

    let server1, server2;

    before('setup servers', () => {
      let collection1 = JSON.parse(
        fs.readFileSync('./test/test-collection.json', 'utf8')
      )
      server1 = new PostmanLocalMockServer(PORT1, collection1)
      server1.start()

      let collection2 = JSON.parse(
        fs.readFileSync('./test/test-collection-2.json', 'utf8')
      )
      server2 = new PostmanLocalMockServer(PORT2, collection2)
      server2.start()
    })

    it('Tests first server', async () => {
      return await axios.get(`http://localhost:${PORT1}/get`).then(res => {
        assert(res.data.args.name === 'Jordan')
      })
    })

    it('Tests second server', async () => {
      return await axios.get(`http://localhost:${PORT2}/get`).then(res => {
        assert(res.data.args.name === 'John')
      })
    })

    after('stop the servers', () => {
      server1.stop();
      server2.stop();
    })
  })

  afterEach(() => {
    server.stop()
  })
})
