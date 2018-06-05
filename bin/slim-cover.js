#!/usr/bin/env node

const slimCover = require( "../src/shell" );
const path = require( "path" );

let baseDir = ".";

if( process.argv.length > 2 ) {
	baseDir = process.argv[ 2 ];
}

baseDir = path.resolve( baseDir );

let coveredPaths = [ baseDir ];

if( process.argv.length > 3 ) {
	coveredPaths = process.argv.slice( 3 ).map( ( coveredPath ) => path.resolve( coveredPath ) );
}

slimCover( baseDir, coveredPaths );