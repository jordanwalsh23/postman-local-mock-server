const fs = require('fs')
const https = require('https');
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3555

let server;

//Agent is needed to use a self-signed certificate in testing
const agent = new https.Agent({  
  rejectUnauthorized: false
});

describe('Postman Local Mock Server Tests with TLS using constructor', () => {
  beforeEach(() => {
    let collection = JSON.parse(
      fs.readFileSync('./test/collections/test-collection.json', 'utf8')
    )

    var key = fs.readFileSync(__dirname + '/tls/server.key')
    var cert = fs.readFileSync(__dirname + '/tls/server.crt')
    var credentials = {
      key: key,
      cert: cert
    }

    server = new PostmanLocalMockServer(PORT, collection, true, credentials)
    server.start()
  })

  describe('Default request tests', () => {
    it('Default GET response test.', async () => {
      return await axios.get(`https://localhost:${PORT}/get`, { httpsAgent: agent }).then(res => {
        assert(res.data.args.name === 'Jordan')
      })
    })

    it('x-mock-response-name test.', async () => {
      return await axios
        .get(`https://localhost:${PORT}/get`, {
          headers: {
            'x-mock-response-name': '200 Different Name'
          },
          httpsAgent: agent
        })
        .then(res => {
          assert(res.data.args.name === 'Not Jordan')
        })
    })

    it('Faker Library Test', async () => {
      return await axios
        .get(`https://localhost:${PORT}/get`, {
          headers: {
            'x-mock-response-name': 'Faker Response'
          },
          httpsAgent: agent
        })
        .then(res => {
          assert(JSON.stringify(res.data).match(/{{\$.+}}/g) === null)
        })
    })

    it('x-mock-response-code test.', async () => {
      return await axios
        .get(`https://localhost:${PORT}/get`, {
          headers: {
            'x-mock-response-code': 201
          },
          httpsAgent: agent
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
        .post(`https://localhost:${PORT}/post`, {}, { httpsAgent: agent })
        .then(res => res.data)
        .then(res => {
          assert(res.data.number === 1)
          assert(res.data.text === 'Quick Brown Fox')
        })
    })

    it('POST response with different body.', async () => {
      return await axios
        .post(
          `https://localhost:${PORT}/post`,
          {
            number: 2,
            text: 'Jumped Over The'
          },
          {
            headers: {
              'x-mock-match-request-body': 'true',
              'content-type': 'application/json'
            },
            httpsAgent: agent
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
          `https://localhost:${PORT}/post`,
          {
            number: 2,
            text: 'Jumped Over The'
          },
          {
            headers: {
              'x-mock-response-name': 'Alternate Response 2',
              'content-type': 'application/json'
            },
            httpsAgent: agent
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
          `https://localhost:${PORT}/post`,
          {
            number: 999,
            text: 'Fred'
          },
          {
            headers: {
              'x-mock-match-request-body': 'true',
              'content-type': 'application/json'
            },
            httpsAgent: agent
          }
        )
        .then(res => {
          //This should not work
          assert(1 == 2)
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

describe('Postman Local Mock Server Tests with TLS using setter methods', () => {
  beforeEach(() => {
    let collection = JSON.parse(
      fs.readFileSync('./test/collections/test-collection.json', 'utf8')
    )

    var key = fs.readFileSync(__dirname + '/tls/server.key')
    var cert = fs.readFileSync(__dirname + '/tls/server.crt')

    server = new PostmanLocalMockServer(PORT, collection, true)

    server.setTLSCertificate(cert);
    server.setTLSPrivateKey(key);

    server.start()
  })

  describe('Default request tests', () => {
    it('Default GET response test.', async () => {
      return await axios.get(`https://localhost:${PORT}/get`, { httpsAgent: agent }).then(res => {
        assert(res.data.args.name === 'Jordan')
      })
    })
  });

  afterEach(() => {
    server.stop()
  })
})
