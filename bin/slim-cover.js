#!/usr/bin/env node

if( process.argv.length < 3 ) {
	console.log( "Specify a project with tests to execute." );
	return;
}

const path = require( "path" );
const fs = require( "fs" );

let baseDir = path.resolve( process.argv[2] );

let runners = [
	{
		require: "./cover-jasmine.js",
		specDir: "spec"
	},
	{
		require: "./cover-mocha.js",
		specDir: "test"
	}
];

for( let runner of runners ) {
	let specDir = baseDir + "/" + runner.specDir;
	let stats = fs.lstatSync( specDir );
	
	if( stats.isDirectory() ) {
		require( runner.require )( baseDir, specDir );
		break;
	}
}