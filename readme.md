# Postman Local Mock Server

[![npm version](https://badge.fury.io/js/@jordanwalsh23%2Fpostman-local-mock-server.svg)](https://badge.fury.io/js/@jordanwalsh23%2Fpostman-local-mock-server)

This project brings Postman's collection mocking capability locally enabling you to create mock servers quickly and run tests against these.

## Quick Start

```bash
npm install -g @jordanwalsh23/postman-local-mock-server
postman-local -c path/to/collection.json -p 8080
```

## Capabilities

- Create a local mock server by supplying a Postman Collection.
- Customizable TCP Port number for your mock server.
- Supports the `x-mock-response-name` and `x-mock-response-code` headers to specify the response you want returned by either name or status code.
- Supports the `x-mock-match-request-headers` header to match only the responses that contain a specific header.
- Supports the `x-mock-match-request-body` header to match responses on POST/PATCH/PUT requests.
- Full support for [Postman's dynamic variables](https://learning.postman.com/docs/writing-scripts/script-references/variables-list/) in example responses.
- Support for wildcard variables in response examples.
- Support for TLS enabled servers by supplying key/certificate.
- Supports a local cache for performance testing.

## CLI Options

```
--collection, -c : Path to your collection file
--port, -p       : Port you would like to use to host the server 0-65535
--key            : Path to Private Key file for TLS protected servers
--cert           : Path to Certificate file for TLS protected servers
--debug, -d      : Print debug statements to console when running.
--cacheTTL       : The time to keep responses in cache - see apicache for options.
```

## Using in your project
1. Run `npm install @jordanwalsh23/postman-local-mock-server`
2. Add the dependency to your project and start the server.

```
const PostmanLocalMockServer = require('@jordanwalsh23/postman-local-mock-server');

let options = {
  port = 3555
}

//Create the collection object.
options.collection = JSON.parse(fs.readFileSync('./test/test-collection.json', 'utf8'));

//Create a new server
let server = new PostmanLocalMockServer(options);

//Start the server
server.start();

//Run some requests against your server
axios.get(`http://localhost:3555`).then(res => {
  //do something with the mocked response.
});

//Stop the server
server.stop();
```

4. The server will now have endpoints available that match your specified collection.

## Caching

This project includes a local cache that can be enabled via the CLI with the `--cacheTTL` flag or as an object when starting your server e.g.

```
//Start the server
server.start({
    cache: true,
    cacheOptions: {
        debug: true,
        defaultDuration: "500ms"
    }
})
```

The defaultDuration and `cacheTTL` parameters must either specify a number of milliseconds, or use plain text english. Some valid examples:

```
defaultDuration: "500ms" 
defaultDuration: "1 minute" 
defaultDuration: "5 minutes" 
defaultDuration: "1 hour" 
defaultDuration: "1 day" 
```

## Known Issues/Limitations

### Tests/Prerequest scripts are not executed

This emulates the endpoints of a collection and the associated example responses. It does not invoke the pre-request or test scripts within a request.

As such, any requests that are reliant on variables (either collection/environment or global) will not work in this library.

### Responses for the same path will take the first available

If your collection has the same path (e.g. `/api/products`) available multiple times, the first response defined will be the one returned by default - regardless of whether this is a successful or error response code.

There are several ways to overcome this:

- Use the `x-mock-response-name` header on your requests to name the mock response you want returned.
- Use the `x-mock-response-code` header on your requests to specify the response code (e.g. 200, 404) you want returned.

If you still cannot get the server to return your specific response, create an issue on this repo with the collection supplied and we'll try to replicate.

### Request Matching algorithm differs from official Postman algorithm

- This library uses a simple scoring based algorithm that mirrors, but does not fully match the more complex [official algorithm](https://learning.postman.com/docs/designing-and-developing-your-api/mocking-data/matching-algorithm/)
- Notable differences include:
  * No document distance / wild card / partial URL matching is supported
  * If `x-mock-response-code` is used and multiple items are found the algorithm will just return the first item instead of prioritising the 2xx response.

## Contributions

Contributions are welcome on this repo. Submit issues or PRs and these will be reviewed for merging.

## License

See the [LICENSE](LICENSE) file.
