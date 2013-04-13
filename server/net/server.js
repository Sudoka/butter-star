/**
 * @fileoverview Serves up a simple, hardcoded index page over http,
 * then creates a websocket.
 * @author Jennifer Fang
 * @author Rohan Halliyal
 * @author Trevor Pottinger
 */

// Get external functions.
var config = require('./../../config.js');
var WebSocketServer = require('ws').Server;
var http = require('http');

// TODO: get path from config file
var EventBuffer =
    require('./eventBuffer.js').EventBuffer;
var Socket = require('./socket.js').Socket;
var WorldState = require('../logic/worldstate.js').WorldState;
var gamelogic = require('../logic/gamelogic.js');
/**
 * Creates an instance of a Server. Does not start up a server, only
 * initializes default member values.
 * @constructor
 */
var Server = function() {
  /**
   * List of the open connections.
   * @type {Array.<wsWebSocket>}
   */
  this.sockets = [];

  /**
   * This is the current game state.
   * @type {Array}
   * TODO: not yet used. also want to change to be an obj
   */
  // this.games = [];

  /**
   * Instance of the WebSocketServer.
   * @type {WebSocketServer}
   */
  this.wsServer = null;

  /**
   * Buffer to hold all incoming client events.
   * @type {EventBuffer}
   */
  this.eventBuffer = null; 
  
  this.worldState = null;
}

/**
 * Start the server and set up event handlers.
 */
Server.prototype.start = function() {
	http.createServer(function (request, response) {
		switch (request.url) {
      // TODO don't hardcode?
			case "/websocket.js":
				response.writeHead(200, {'Content-Type': 'text/javascript'});
				response.write(simpleJS);
				break;
			default:
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(simpleHTML);
				break;
		}
		response.end();
	}).listen(config.httpPort, '0.0.0.0'); // allow connections from all IPs
	console.log('HTTP server running at %d.', config.httpPort);
  
  this.wsServer = new WebSocketServer({port:config.wsPort});
  this.eventBuffer = new EventBuffer();
  this.worldState = new WorldState();

  // Variables to use in handler
  var socketList = this.sockets;
  var serverEventBuffer = this.eventBuffer;
  var worldstate = this.worldState;

  /**
   * Handles the server opening a connection.
   * @param {wsWebSocket} wsSocket WebSocket opening a connection with.
   */
  this.wsServer.on('connection', function(wsSocket) {
      console.log('New connection created! %d', socketList.length);
      var socket = new Socket(wsSocket);
      socketList.push(socket);

      
      socket.onmessage(serverEventBuffer);
      socket.onclose(socketList);
      
      // Tell the client its unique ID
      var socketID = socketList.length - 1;
      socket.send("ID:" + socketID);

      worldstate.addNewPlayer(socketID);
  });
}

/**
 * Return the list of sockets connected to the Server.
 * @return {Array.<wsWebSocket>} The list of sockets.
 */
Server.prototype.getSockets = function() {
    return this.sockets;
}

/**
 * Sends updated game state to all clients.
 *
 * Note(jyfang): Must send Float32Array, NOT the underlying ArrayBuffer
 * because of how ws's send works.
 */
Server.prototype.updateAllClients = function() {
	// connection.socket.send(connection.getStateTypedArray(), {binary: true});
  // TODO send typed arrays
  
    gamelogic.processEvents(this.eventBuffer, this.worldState);

    for (var i = 0; i < this.sockets.length; i++) {
        if (this.sockets[i] != null) {
            //console.log("sending " + JSON.stringify(this.worldState));
            this.sockets[i].send(JSON.stringify(this.worldState));
        }
    }
}

exports.Server = Server;
