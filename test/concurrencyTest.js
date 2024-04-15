const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

var options1 = {
  debug: true
}

var options2 = {
  debug: true
}

describe('multiple concurrent server tests', () => {
  const PORT1 = 5555
  const PORT2 = 5556
  
  let server1, server2;

  before('setup servers', () => {
    options1.collection = JSON.parse(
      fs.readFileSync('./test/collections/test-collection.json', 'utf8')
    )

    options1.port = PORT1;

    server1 = new PostmanLocalMockServer(options1)
    server1.start()

    options2.collection = JSON.parse(
      fs.readFileSync('./test/collections/test-collection-2.json', 'utf8')
    )

    options2.port = PORT2;

    server2 = new PostmanLocalMockServer(options2)
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

describe('reusing the same server', () => {
  const PORT1 = 5566

  let server1;

  before('setup servers', () => {
    options1.collection = JSON.parse(
      fs.readFileSync('./test/collections/test-collection.json', 'utf8')
    )

    options1.port = PORT1;

    server1 = new PostmanLocalMockServer(options1)
    server1.start()
  })

  it('Tests first server', async () => {
    return await axios.get(`http://localhost:${PORT1}/get`).then(res => {
      assert(res.data.args.name === 'Jordan')
    })
  })

  it('Sets up the second server', async () => {
    server1.stop();

    options2.collection = JSON.parse(
      fs.readFileSync('./test/collections/test-collection-2.json', 'utf8')
    )

    options2.port = PORT1;

    server1 = new PostmanLocalMockServer(options2)
    server1.start()
  })

  it('Tests second server', async () => {
    return await axios.get(`http://localhost:${PORT1}/get`).then(res => {
      assert(res.data.args.name === 'John')
    })
  })

  after('stop the server', () => {
    server1.stop();
  })
})