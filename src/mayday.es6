import * as teamRed from "./teamOne";


function initialize() {
	var globalState = globalInit();

	var globalStateCopy = {};
	console.log("Got a global state copy:", globalStateCopy);
	// $.extend(true, globalStateCopy, globalState);

	teamRed.initState();
	// var teamRedState = Init(globalStateCopy);
}

function globalInit() {
	return {
		"data": "stuff"
	};
}

initialize();
