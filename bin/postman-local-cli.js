#!/usr/bin/env node
const yargs = require("yargs");
const fs = require('fs');
const PostmanLocalMockServer = require('../lib/server');

const options = yargs
 .usage("Usage: -c <filename or URL>")
 .option("c", { alias: "collection", describe: "Path to your collection file.", type: "string", demandOption: true })
 .option("p", { alias: "port", describe: "The port you would like to use.", type: "string", default: 3555, demandOption: false })
 .option("v", { alias: "verbose", describe: "Verbose output", type: "boolean", default: false, demandOption: false })
 .argv;

async function main() {

  if(options.collection) {

    let collection, port, verbose;
    try {
      // if collection is a url starting with http, try to download it
      if (options.collection.startsWith('http')) {
        collection = await fetch(options.collection)
        .then(response => response.json())
        .catch(e => {
          e = new Error("Provided URL was not a valid Collection")
          e.code = "ERR_NON_JSON_RESPONSE";
          throw e;
        });
      } else {
        collection = JSON.parse(fs.readFileSync(options.collection, 'utf8'));
      }

      if(options.port && !isNaN(options.port)) {
        port = options.port;
      } else {
        //This will never work so will always throw an error.
        port = 99999;
      }

      if(options.verbose) {
        verbose = options.verbose
      }

      //Create a new server
      let server = new PostmanLocalMockServer(port, collection, verbose);

      //Start the server
      server.start();

    } catch(e) {
      if(e.code == 'ENOENT') {
        console.log(`Error starting local mock server. Collection file not found: "${options.collection}"`)
      } else if (e.code == 'ERR_SOCKET_BAD_PORT') {
        console.log("Error starting local mock server. Could not bind server to port:",options.port)
      } else if (e.code == 'ERR_NON_JSON_RESPONSE') {
        console.log("Error starting local mock server. The URL provided was not a valid collection file. Check your URL and try again:",options.collection)
      }else {
        console.log(e.code)
      }
    }

    
    
  }
}

main();