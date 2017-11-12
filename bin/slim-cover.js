#!/usr/bin/env node

const path = require( "path" );
const fs = require( "fs" );

let baseDir = ".";

if( process.argv.length > 2 ) {
	baseDir = process.argv[ 2 ];
}

baseDir = path.resolve( baseDir );

let coveredPaths = [ baseDir ];

if( process.argv.length > 3 ) {
	coveredPaths = process.argv.slice( 3 ).map( ( coveredPath ) => path.resolve( coveredPath ) );
}

let runners = [
	{
		module: "jasmine",
		specDir: "spec"
	}
];

for( let runner of runners ) {
	let specDir = baseDir + "/" + runner.specDir;
	let stats = fs.lstatSync( specDir );
	
	if( stats.isDirectory() && hasModule( runner.module ) ) {
		require( `./cover-${runner.module}.js` )( baseDir, specDir, coveredPaths );
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