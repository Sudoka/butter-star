/**
 * client/net/loader.js
 *
 * Handle ordered client loading of libraries
 *
 * @author Trevossdwwwwsss
 */

var filesLoaded = 0, filesNeeded = 50;

// TODO order!!
var scripts = [
	// libraries
	["three.min.js", "text/javascript", null], 
	["MTLLoader.js", "text/javascript", null], // TODO is thisbeing used?
	["OBJMTLLoader.js", "text/javascript", null], 
	["stats.min.js", "text/javascript", null], 
	["jquery.js", "text/javascript", null], 
	["jquery-ui.js", "text/javascript", null], 
	["ColladaLoader.js", "text/javascript", null], 

	// objects 
	["player.js", "text/javascript", null], 
	["worldstate.js", "text/javascript", null], 
	["critter.js", "text/javascript", null], 
	["environment.js", "text/javascript", null], 
	
	// TODO IDK what this is for...
	//"ThreeOctree.js",

	// networking 
	["ControlsEvent.js", "text/javascript", null], 
	["connection.js", "text/javascript", null], 

	// controls
	["controls.js", "text/javascript", null], 
	["keyboard.js", "text/javascript", null], 
	["mouse.js", "text/javascript", null], 
	["screen.js", "text/javascript", null], 
	["THREEx.FullScreen.js", "text/javascript", null], 
	["PointerLockControls.js", "text/javascript", null], 

	// shaders
	["vacuum.js", "text/javascript", null], 
	["basic-vert.js", "text/javascript", "vertexShader"],
	["basic-frag.js", "text/javascript", "fragmentShader"],

	// gui
	["minimap.js", "text/javascript", null], 
	["options.js", "text/javascript", null], 
	["notifications.js", "text/javascript", null], 
	["status.js", "text/javascript", null], 

	// this defines main()
	["main.js", "text/javascript", null] 
];

// entries are structured: [model, model name, obj file, mtl file, scale]
var models = {
	players : [
		[null, 'Default player', 'boy.obj', 'boy.mtl', 0.04],
		[null, 'Yixin Cube', 'yixin_cube.obj', 'yixin_cube.mtl', 0.1]
	],
	critters : [
		[null, 'Default critter', 'boo.obj', 'boo.mtl', 0.4]
	],
	environments : [
		[null, 'Default room', 
			'roomWithWindows.obj', 'roomWithWindows.mtl', 1.],
		[null, 'Blank room', 'blankRoom.obj', 'blankRoom.mtl', 1.]
	],
	food : [
	]
};

var animations = {
	players : [
	],
	critters : [
	],
	environments : [
	],
	food : [
	]
};

/**
 * appends script elements to the DOM
 * @param scripts - a list/object
 * @param doc - the document global
 */
function loadScripts(scripts, doc) {
	var head = doc.getElementsByTagName('head')[0];
	singleScriptLoader(scripts, 0, doc, head);
}

/**
 * Appends a single script at a time
 * scripts - a list of script URLs
 * index - the position in list, must be used as key to scripts
 * head - the DOM element to be appended to
 */
function singleScriptLoader(scripts, index, doc, head) {
	// stop recurrance
	if (index >= scripts.length) {
		loadModels();
		//attemptStart();
		//_lastFunc();
		return;
	}

	console.log('Loading "%s" %d/%d', 
			scripts[index][0], index+1, scripts.length);

	// create the new DOM script element from the url
	var script = doc.createElement('script');
	script.setAttribute('src', scripts[index][0]);
	script.setAttribute('type', scripts[index][1]); 

	if (scripts[index][2] != null) {
		script.setAttribute('id', scripts[index][2]); 
	}

	// load next file!
	script.onload = function() {
		console.log('loaded %s', scripts[index][0]);
		singleScriptLoader(scripts, index+1, doc, head);
	};

	head.appendChild(script);
	attemptStart();
}

/**
 * loads all the .obj and .mtl files for players, critter, environments, etc.
 */
function loadModels() {
	// stupid javascript
	function loadFunc(type, index) {
		return function(evt) {
			var object = evt.content;
			var scale = models[type][index][4];
			object.scale.set(scale, scale, scale);
			models[type][index][0] = object;
			console.log("%s loaded %d/%d.", type, index+1, models[type].length);
			attemptStart();
		};
	}
	console.log("Loading models");
	for (var type in models) {
		for (var i = 0; i < models[type].length; i++) {
			var loader = new THREE.OBJMTLLoader();
			loader.addEventListener( 'load', loadFunc(type, i) );
			loader.load( models[type][i][2], models[type][i][3] );
		}
	}
}

/**
 * loads all the .dae files for animations
 */
function loadAnimations() {
	// http://stackoverflow.com/questions/16202602/multiple-different-collada-scenes-with-three-js-animation-wont-work
	// stupid javascript
	function loadFunc(type, index) {
		return function(collada) {
			var object = collada.scene;
			// TODO
			var scale = animationFiles[type][index][3];
			object.scale.set(scale, scale, scale);
			// TODO
			animations[type][index] = object;
			// TODO
			console.log("%s animation \"%s\" loaded %d/%d.", type, 
					animationFiles[type][index][0], index+1, 
					animationFiles[type].length);
			attemptStart();

			// something about collada.skins[0]
		};
	}
	console.log("Loading animations");
	// TODO
	for (var type in animationFiles) {
		// TODO
		for (var i = 0; i < animationFiles[type].length; i++) {
			var loader = new THREE.ColladaLoader();
			loader.addEventListener( 'load', loadFunc(type, i) );
			// TODO
			loader.load( animationFiles[type][i][1], animationFiles[type][i][2] );
		}
	}
}

/**
 * Guarantees all models, animations, and scripts are loaded before 
 * starting main
 */
function attemptStart() {
	filesLoaded++;
	if (filesLoaded == filesNeeded) {
		console.log("Enough loading, time to play!");
		main();
	}
}
