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
--collection, -c       : Path to your collection file
--port, -p             : Port you would like to use to host the server 0-65535
--key                  : Path to Private Key file for TLS protected servers
--cert                 : Path to Certificate file for TLS protected servers
--allowedDomains       : Comma-separated list of domains allowed to access the mock server. If not specified, all domains are allowed.
--debug, -d            : Print debug statements to console when running.
--cacheTTL             : The time to keep responses in cache - see apicache for options.
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

### Clearing the cache
Restarting the server will automatically clear the in-memory cache, however if you want to clear the cache while the server is still running you can use the following endpoint:

```
DELETE http://localhost:<PORT>/cache

204 No Content
```

Unfortunately this will clash if there is an endpoint in your supplied collection with the path `/cache`. In that instance you can fork a copy of the source code and change this path manually.

## Domain Allowlist

This project includes a domain allowlist feature that allows you to restrict which domains can access the mock server. When a domain is added to the allowlist, cookies for that domain can be accessed in scripts using the `pm.cookies.jar()` methods.

### Using Domain Allowlist via CLI

Use the `--allowedDomains` (or `--allowDomains`) flag to specify a comma-separated list of allowed domains:

```bash
postman-local -c path/to/collection.json -p 8080 --allowedDomains "localhost,example.com,api.example.com"
```

### Using Domain Allowlist Programmatically

When starting your server programmatically, pass the `allowedDomains` option:

```javascript
const PostmanLocalMockServer = require('@jordanwalsh23/postman-local-mock-server');
const fs = require('fs');

let options = {
  port: 3555,
  allowedDomains: ['localhost', 'example.com', 'api.example.com']
};

options.collection = JSON.parse(fs.readFileSync('./test/test-collection.json', 'utf8'));

let server = new PostmanLocalMockServer(options);
server.start();
```

### How it Works

- If `allowedDomains` is not specified or is an empty array, all domains are allowed to access the mock server.
- When a domain attempts to access the server, its hostname is extracted from the request's `Host` header.
- The server checks if the domain exactly matches an allowed domain or is a subdomain of an allowed domain (e.g., `api.example.com` is allowed if `example.com` is in the allowlist).
- If the domain is not in the allowlist, the server returns a `403 Forbidden` response with a descriptive error message.
- Allowed domains can then access cookies for their domain using `pm.cookies.jar()` in Postman scripts.

### Example

If you configure the server with:
```bash
postman-local -c collection.json -p 8080 --allowedDomains "localhost,example.com"
```

Then:
- ✅ Requests from `localhost` will be allowed
- ✅ Requests from `example.com` will be allowed
- ✅ Requests from `api.example.com` will be allowed (subdomain)
- ❌ Requests from `other.com` will be blocked with a 403 response

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

- This library uses a scoring based algorithm that mirrors closely, but does not fully match the [official algorithm](https://learning.postman.com/docs/designing-and-developing-your-api/mocking-data/matching-algorithm/)
- Differences include:
  * If `x-mock-response-code` is used and multiple items are found the algorithm will just return the first item instead of prioritising the 2xx response.
  * If the document distance algorithm is used as no other matches can be found, the first result that meets the criteria is returned instead of calculating all responses and returning the highest score.

## Contributions

Contributions are welcome on this repo. Submit issues or PRs and these will be reviewed for merging.

## License

See the [LICENSE](LICENSE) file.
