const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 4000;

var options = {
  port: PORT,
  debug: true
}

let server

describe('Score Tests', () => {
  before(() => {
    options.collection = JSON.parse(
      fs.readFileSync('./test/collections/test-scoring-collection.json', 'utf8')
    )
  
    server = new PostmanLocalMockServer(options)
    server.start()
  })

  describe('Default request tests', () => {
    it('Matches on Path only.', async () => {
      return await axios.get(`http://localhost:${PORT}/get`).then(res => {
        assert(Object.keys(res.data.args).length == 0);
        assert(res.headers['x-mock-matched-score'] == 100);
        assert(res.headers['x-mock-matched-response-name'] == "Success");
      })
    })

    it('Matches on Path only after removing trailing slash.', async () => {
      return await axios.get(`http://localhost:${PORT}/get/`).then(res => {
        assert(Object.keys(res.data.args).length == 0);
        assert(res.headers['x-mock-matched-score'] == 95);
        assert(res.headers['x-mock-matched-response-name'] == "Success");
      })
    })

    it('Matches on Path only with case insensitive.', async () => {
      return await axios.get(`http://localhost:${PORT}/Get`).then(res => {
        assert(Object.keys(res.data.args).length == 0);
        assert(res.headers['x-mock-matched-score'] == 90);
        assert(res.headers['x-mock-matched-response-name'] == "Success");
      })
    })

    it('Matches on Path and Query Parameter Name.', async () => {
      return await axios.get(`http://localhost:${PORT}/get?name=Fred`).then(res => {
        assert(Object.keys(res.data.args).length == 1);
        assert(res.headers['x-mock-matched-score'] == 100);
        assert(res.headers['x-mock-matched-response-name'] == "Match Query Param & Path");
      })
    })

    it('Matches on Path, Query Parameter Name and Value.', async () => {
      return await axios.get(`http://localhost:${PORT}/get?name=John`).then(res => {
        assert(Object.keys(res.data.args).length == 1);
        assert(res.headers['x-mock-matched-score'] == 110);
        assert(res.headers['x-mock-matched-response-name'] == "Match Query Param & Path");
      })
    })

    it('Matches on Path and Header Name', async () => {
      return await axios.get(`http://localhost:${PORT}/get`, {
        headers: {
          "x-mock-match-request-headers": "name",
          name: "Fred"
        }
      }).then(res => {
        assert(res.data.headers.name != "");
        assert(res.headers['x-mock-matched-score'] == 100);
        assert(res.headers['x-mock-matched-response-name'] == "Match Header Name");
      })
    })

  })

  after(() => {
    server.stop()
  })
})
