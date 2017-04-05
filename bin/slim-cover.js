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