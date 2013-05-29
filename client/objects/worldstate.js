/**
 * worldstate.js
 *
 * Client side stuff.
 *
 * @author Rohan
 * @author Thinh
 * @author Trevor
 */

// also set in server/objects/collidable.js
var types = {
	COLLIDABLE : 0,
	MOVABLE : 1,
	PLAYER : 2,
	CRITTER : 3,
	ENVIRONMENT : 4,
	FOOD : 5
};

/**
 * Constructor for the world instance.
 * @constructor
 */
var WorldState = function() {
  this.players = {};
  this.critters = {};
  this.environments = {};
  this.foods = {};
}

/**
 * initialize this world state based off of the recevied initial server
 * data, including players, environments, critters, and food
 */
WorldState.prototype.addObjects = function(objArr) {
	for (var i = 0; i < objArr.length; i++) {
		this.add(objArr[i]);
	}
}

/**
 * generic ADD function, determines type and then calls specific add
 */
WorldState.prototype.add = function(object) {
	switch (object.type) {
		case types.PLAYER:
			this.addPlayer(object);
			break;
		case types.CRITTER:
			this.addCritter(object);
			break;
		case types.ENVIRONMENT:
			this.addEnvironment(object);
			break;
		case types.FOOD:
			this.addFood(object);
			break;
		default:
			console.log("Client unrecognized type: %s", object);
	}
}

WorldState.prototype.addPlayer = function(p) {
	var player = new Player(p);
	this.players[player.id] = player;

	scene.add(player.mesh);
}

WorldState.prototype.addCritter = function(critter) {
  var crit = new Critter(critter);
  this.critters[crit.id] = crit;

  scene.add(crit.mesh);
}

WorldState.prototype.addEnvironment = function(env) {
	var enviro = new Environment(env);
	this.environments[env.id] = enviro;

	scene.add(enviro.mesh);
}

WorldState.prototype.addFood = function(f) {
  var food = new Food(f);
  this.foods[food.id] = food;

  scene.add(food.mesh);
}

/**
 * generic REMOVE function, determines type and then calls specific remove
 */
WorldState.prototype.remove = function(id) {
	if (id in this.players) {
		this.removePlayer(id);
	}
	else if (id in this.critters) {
		this.removeCritter(id);
	}
	else if (id in this.critters) {
		this.removeEnvironment(id);
	}
	else if (id in this.critters) {
		this.removeFood(id);
	}
	else {
		console.log("Client unrecognized id: %s", id);
	}
}

WorldState.prototype.removePlayer = function(id) {
	scene.remove(this.players[id].mesh);
	delete this.players[id];
}

WorldState.prototype.removeCritter = function(id) {
	scene.remove(this.critters[id].mesh);
	delete this.critters[id];
}

WorldState.prototype.removeEnvironment = function(id) {
	scene.remove(this.environment[id].mesh);
	delete this.environment[id];
}

WorldState.prototype.removeFood = function(id) {
  scene.remove(this.foods[id].mesh);
  delete this.foods[id];
}

// TODO remove this function? 
WorldState.prototype.getPlayerObject = function(id) {
    return this.players[id];
}

/**
 * newStates is an array of objects, each object represents a collidable
 *   object on the server and contains: id, position, orientation, state
 */
WorldState.prototype.updateWorldState = function(newStates){
	for (var i = 0; i < newStates.length; i++) {
		var update = newStates[i], 
			id = update.id;
		if (update.id in this.players) {
			// our stuff
			this.players[id].position.copy(update.position);
			this.players[id].orientation.copy(update.orientation);
			this.players[id].state = update.state;

			// necessary for graphics
			this.players[id].mesh.position.copy(update.position);
		 
      this.players[id].mesh.lookAt( forwards(this.players[id].position, this.players[id].orientation) );
      
      if(this.players[id].mesh.position.z < 0)
      {
        this.players[id].mesh.rotation.y -= 45 * Math.PI/2;  
      }
      else
      {
        this.players[id].mesh.rotation.y += 45 * Math.PI/2;
      }
//this.players[id].mesh.lookAt( forwards(this.players[id].position, this.players[id].orientation) );
		}
		else if (update.id in this.critters) {
			this.critters[id].position.copy(update.position);
			this.critters[id].orientation.copy(update.orientation);
			this.critters[id].state = update.state;

			// necessary for graphics
			this.critters[id].mesh.position.copy(update.position);
			this.critters[id].mesh.lookAt( forwards(this.critters[id].position,
						this.critters[id].orientation) );

		}
    else if (update.id in this.critters) {
      this.foods[id].position.copy(update.position);
      this.foods[id].state = update.state;

      // necessary for graphics
      this.foods[id].mesh.position.copy(update.position);
      this.foods[id].mesh.lookAt( forwards(this.foods[id].position,
          this.foods[id].orientation) );
    }
	}

}

/**
 * Returns a point that is projected onto the x-z (horizontal) axis
 * in the direction specified by orientation
 */
function forwards(position, orientation) {
	var up = new THREE.Vector4(0, 1, 0, 0);

	// up becomes the orientation projected upwards
	up.multiplyScalar(up.dot(orientation));

	// projected is the orientation projected onto the x-z (horizontal) plane
	var projected =  orientation.clone().sub(up);

	// returns a point that is in front of you
	return projected.add(position);
}
