#!/usr/bin/env node

const slimCover = require( "../src/shell" );
const { resolve } = require( "path" );
const { createWriteStream } = require( "fs" );
const getArgs = require( "mri" );

const args = getArgs( process.argv.slice( 2 ) );

function sanitizeStringArg( arg ) {
	if( typeof arg === "string" ) {
		return [ arg ];
	}
	
	if( Array.isArray( arg ) ) {
		return arg;
	}
	
	return [];
}

const resolvePath = path => resolve( path );

const options = {
	project: sanitizeStringArg( args.project )[ 0 ],
	includes: sanitizeStringArg( args.include ).map( resolvePath ),
	excludes: sanitizeStringArg( args.exclude ).map( resolvePath ),
	reporters: sanitizeStringArg( args.reporter )
};

if( options.project === undefined ) {
	options.project = ".";
}

options.project = resolve( options.project );
options.includes = options.includes.map( resolvePath );
options.excludes = options.excludes.map( resolvePath );

if( options.includes.length === 0 ) {
	options.includes.push( options.project );
}

options.reporters = options.reporters.map( reporter => {
	let [ name, destination ] = reporter.split( "," );
	if( destination === undefined ) {
		destination = process.stdout;
	}
	else {
		destination = createWriteStream( destination );
	}
	return { name, destination };
} );

slimCover( options );