#!/usr/bin/env node

const path = require( "path" );
const fs = require( "fs" );

let baseDir;

if( process.argv.length > 2 ) {
	baseDir = process.argv[ 2 ];
}
else {
	baseDir = ".";
}

baseDir = path.resolve( baseDir );

let runners = [
	{
		module: "jasmine",
		specDir: "spec"
	},
	{
		module: "mocha",
		specDir: "test"
	}
];

for( let runner of runners ) {
	let specDir = baseDir + "/" + runner.specDir;
	let stats = fs.lstatSync( specDir );
	
	if( stats.isDirectory() && hasModule( runner.module ) ) {
		require( `./cover-${runner.module}.js` )( baseDir, specDir );
		break;
	}
}

const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function hasModule( module ) {
	try {
		require.resolve( module );
	}
	catch( e ) {
		console.log( `In order to run these tests you must install ${BOLD}${module}${RESET} via npm` );
		return false;
	}
	
	return true;
}