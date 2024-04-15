#!/usr/bin/env node
const yargs = require("yargs");
const fs = require('fs');
const PostmanLocalMockServer = require('../lib/server');

const cliOptions = yargs
 .usage("Usage: -c <Path to Collection JSON file, or URL>, -p <Port to use>")
 .option("collection", { alias: "c", describe: "Path to your Collection JSON file, or URL.", type: "string", demandOption: true })
 .option("port", { alias: "p", describe: "The port you would like to use.", type: "number", demandOption: true })
 .option("key", { describe: "Path to the TLS private key file.", type: "string", demandOption: false })
 .option("cert", { describe: "Path to your TLS certificate file.", type: "string", demandOption: false })
 .option("debug", { alias: "d", describe: "Add debug statements.", type: "boolean", default: false, demandOption: false })
 .argv;

async function main() {

  if(cliOptions.collection) {

    let serverOptions = {};
    try {
      // if collection is a url starting with http, try to download it
      if (cliOptions.collection.startsWith('http')) {
        serverOptions.collection = await fetch(cliOptions.collection)
        .then(response => response.json())
        .catch(e => {
          e = new Error("Provided URL was not a valid Collection")
          e.code = "ERR_NON_JSON_RESPONSE";
          throw e;
        });
      } else {
        serverOptions.collection = JSON.parse(fs.readFileSync(cliOptions.collection, 'utf8'));
      }

      if(cliOptions.port && !isNaN(cliOptions.port)) {
        serverOptions.port = cliOptions.port;
      } else {
        serverOptions.port = 3555;
      }

      if(cliOptions.debug) {
        serverOptions.debug = cliOptions.debug
      }

      if(cliOptions.key && cliOptions.cert) {
        var key = fs.readFileSync(cliOptions.key)
        var cert = fs.readFileSync(cliOptions.cert)

        serverOptions.credentials = {
          key: key,
          cert: cert
        }
      }

      //Create a new server
      let server = new PostmanLocalMockServer(serverOptions);

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