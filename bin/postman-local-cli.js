#!/usr/bin/env node
const yargs = require("yargs");
const fs = require('fs');
const PostmanLocalMockServer = require('../lib/server');

const options = yargs
 .usage("Usage: -c <filename>")
 .option("c", { alias: "collection", describe: "Path to your collection file.", type: "string", demandOption: true })
 .option("p", { alias: "port", describe: "The port you would like to use.", type: "string", default: 3555, demandOption: false })
 .argv;

if(options.collection) {

  let collection, port;
  try {
    //Create the collection object.
    collection = JSON.parse(fs.readFileSync(options.collection, 'utf8'));

    if(options.port && !isNaN(options.port)) {
      port = options.port;
    } else {
      //This will never work so will always throw an error.
      port = 99999;
    }

    //Create a new server
    let server = new PostmanLocalMockServer(port, collection);

    //Start the server
    server.start();

  } catch(e) {
    if(e.code == 'ENOENT') {
      console.log(`Error starting local mock server. Collection file not found: "${options.collection}"`)
    } else if (e.code == 'ERR_SOCKET_BAD_PORT') {
      console.log("Error starting local mock server. Could not bind server to port:",options.port)
    } else {
      console.log(e)
    }
  }

  
  
}