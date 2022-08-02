# Postman Local Mock Server

This project brings Postman's collection mocking capability locally enabling you to create mock servers quickly and run tests against these.

## Capabilities

- Create a local mock server by supplying a Postman Collection.
- Customizable TCP Port number for your mock server.
- Supports the `x-mock-response-name` header to specify the response you want to return.

## Getting Started

1. Clone the repo
2. Import the `postman-local` module into your project `npm install <path-to-postman-local>`
3. Add the dependency and start the server.

```
const PostmanLocalMockServer = require('postman-local')

let server = new PostmanLocalMockServer(port, collection)
  return server.start((err) => {
    if (err) {
      console.log(err)
      return err;
    } else {
      return `http://localhost:${port}`;
    }
  });
```

4. The server will now have endpoints available that match your specified collection.

## Known Issues

### Responses for the same path will take the first available

If your collection has the same path (e.g. `/api/products`) available multiple times, the first response defined will be the one returned by default - regardless of whether this is a successful or error response code.

To get around this, use the `x-mock-response-name` header on your requests to specify the mock response you would like returned.

## Contributions

Contributions are welcome on this repo. Submit issues or PRs and these will be reviewed for merging.

## License

Copyright 2022 Jordan Walsh

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
