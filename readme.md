# Postman Local Mock Server

This project brings Postman's collection mocking capability locally enabling you to create mock servers quickly and run tests against these.

## Capabilities

- Create a local mock server by supplying a Postman Collection.
- Customizable TCP Port number for your mock server.
- Supports the `x-mock-response-name` and `x-mock-response-code` headers to specify the response you want returned by either name or status code.

## Getting Started

1. Run `npm install @jordanwalsh23/postman-local-mock-server`
2. Add the dependency to your project and start the server.

```
const PostmanLocalMockServer = require('@jordanwalsh23/postman-local-mock-server');

//Create the collection object.
let collection = JSON.parse(fs.readFileSync('./test/test-collection.json', 'utf8'));

//Create a new server
let server = new PostmanLocalMockServer(3555, collection);

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

## Known Issues

### Responses for the same path will take the first available

If your collection has the same path (e.g. `/api/products`) available multiple times, the first response defined will be the one returned by default - regardless of whether this is a successful or error response code.

There are several ways to overcome this:

- Use the `x-mock-response-name` header on your requests to name the mock response you want returned.
- Use the `x-mock-response-code` header on your requests to specify the response code (e.g. 200, 404) you want returned.

If you still cannot get the server to return your specific response, create an issue on this repo with the collection supplied and we'll try to replicate.

## Contributions

Contributions are welcome on this repo. Submit issues or PRs and these will be reviewed for merging.

## License

See the [LICENSE](LICENSE) file.
