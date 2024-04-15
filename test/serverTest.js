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
      fs.readFileSync('./test/collections/test-collection.json', 'utf8')
    )

    server = new PostmanLocalMockServer(options)
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
        .then(res => {
          //This should not work
          assert(1 == 2);
        })
        .catch(err => {
          assert(err.response.status === 404)
        })
    })
  })

  afterEach(() => {
    server.stop()
  })
})
