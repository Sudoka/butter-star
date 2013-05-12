/**
 * websocket.js
 * 
 * Sets up connection and communication to and from the server.
 * @author Jennifer Fang
 * @author Trevor Pottinger
 * @author Rohan Halliyal
 */

function Connection(ip, port, gameid, player, world) {
	this.ip = ip;
	this.port = port;
	this.gameid = gameid;

	// TODO getting an undefined error, line 43
	this.messages = [];

	this.socket = new WebSocket('ws://' + this.ip + ':' + this.port + 
		'/' + this.gameid); 

	// MORE JAVASCRIPT BULLSHIT
	this.socket.myPlayer = player;
	this.socket.myWorldState = world;

	this.socket.binaryType = 'arraybuffer';
	this.socket.onopen = this._onopen;
	this.socket.onerror = this._onerror;
	this.socket.onclose = this._onclose;
	this.socket.onmessage = this._onmessage;

	var socket = this.socket;
	function clientTick() {
		 //if (hasBeenSent == false) {
			  if (socket.readyState != socket.OPEN) {
					console.log("Connection is not ready yet!");
			  } 
			  else if (keyPresses.length == 0) {
				  //console.log("keyPresses is empty");
			  }
			  else {
				  console.log(keyPresses);
					socket.send(JSON.stringify(keyPresses));
					/*
					// dont flag event as sent if vacuum is on since client can be
					// moving without pressing any keys (acceleration)
					if (controlsEvent.isVacuum == false) {
						hasBeenSent = true; 
					}
					*/
			  }
		 //}
	}

	setInterval(clientTick, 1000/60);
}

Connection.prototype._onopen = function() {
	console.log("Connection is opened!");
};

Connection.prototype._onerror = function(err) {
  console.log('WebSocket Error: ' + err);
};

Connection.prototype._onclose = function() {
    console.log("connection closed!");
};

Connection.prototype._onmessage = function(buf) {
	// TODO undefined error here
	//this.messages.push(buf.data);

  //console.log(buf.data);
    // connection initialized
	if (buf.data.substring(0,3) == "ID:") {
		this.myPlayer.id = buf.data.substring(3);
		// TODO ???? 
		//controlsEvent.playerID = this.myPlayer.id;
		console.log("Client recieved id: " + myPlayer.id);

        initClientSend(this); // Pass the socket to the send loop

		return;
	}

	var state = JSON.parse(buf.data);
	if ('remove' in state) {
		this.myWorldState.removePlayer(state['remove']);
	}
	else {
		// state is an array of players
		this.myWorldState.updateWorldState(state);
	}

	var tempPlayer = myWorldState.getPlayerObject(myPlayer.id);
	this.myPlayer.position = tempPlayer.mesh.position;
	this.myPlayer.vacTrans = tempPlayer.vacTrans;
};

