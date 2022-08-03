const fs = require('fs');
const PostmanLocalMockServer = require('../index.js');
const axios = require('axios').default;
const assert = require('assert');

const PORT = 3555;

let server;

describe('Postman Local Mock Server Tests', () => {

  before(() => {
    let collection = JSON.parse(fs.readFileSync('./test/test-collection.json', 'utf8'));
    server = new PostmanLocalMockServer(PORT, collection);
    server.start();
  });

  it('Default response test.', async () => {
    return await axios.get(`http://localhost:${PORT}/get`).then(res => {
      assert(res.data.args.name === "Jordan")
    });
  });

  it('x-mock-response-name test.', async () => {
    return await axios.get(`http://localhost:${PORT}/get`, {
      headers: {
        'x-mock-response-name': "200 Different Name"
      }
    }).then(res => {
      assert(res.data.args.name === "Not Jordan")
    });
  });

  it('x-mock-response-code test.', async () => {
    return await axios.get(`http://localhost:${PORT}/get`, {
      headers: {
        'x-mock-response-code': 201
      }
    }).then(res => {
      assert(res.status === 201);
      assert(res.data.message === "Item has been created.");
    })
  });

  after(() => {
    server.stop();
  });
})
