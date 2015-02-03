var  net = require("net")
, repl = require("repl");

brain = require("./brain2.js")

connections = 0;

repl.start({
    prompt: "node via stdin> "
    , input: process.stdin
    , output: process.stdout
    , useColors : true 
    , useGlobal : true 
});

// net.createServer(function (socket) {
//   connections += 1;
//   repl.start({
//       prompt: "node via Unix socket> "
//       , input: socket 
//       , output: socket
//   }).on('exit', function() {
//     socket.end();
//   })
// }).listen("/tmp/node-repl-sock");

// net.createServer(function (socket) {
//   connections += 1;
//   repl.start({
//       prompt: "node via TCP socket> "
//       , input: socket 
//       , output: socket
//   }).on('exit', function() {
//     socket.end();
//   });
// }).listen(5001) ;


