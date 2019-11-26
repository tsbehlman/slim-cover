#!/usr/bin/env node

const slimCover = require( "../src/shell" );
const getArgs = require( "mri" );
const path = require( "path" );

const args = getArgs( process.argv.slice( 2 ) );

function sanitizeStringArg( arg = [] ) {
	if( arg.constructor === String ) {
		return [ arg ];
	}
	
	return arg;
}

let options = {
	project: sanitizeStringArg( args.project ).pop(),
	includes: sanitizeStringArg( args.include ),
	excludes: sanitizeStringArg( args.exclude ),
	reporters: sanitizeStringArg( args.reporter ).map( reporter => {
		const [ type, destination ] = reporter.split( "," );
		return { type, destination };
	} )
};

const customConfigFile = sanitizeStringArg( args.config ).pop();
const configFile = customConfigFile || ".slim-cover.json";

let configFileOptions;

try {
	configFileOptions = require( path.resolve( configFile ) );
}
catch( e ) {
	if( customConfigFile !== undefined ) {
		console.error( "Error reading custom config file: ", e );
	}
}

if( configFileOptions !== undefined ) {
	function mergeOptionalArrays( left = [], right = [] ) {
		return [ ...left, ...right ];
	}
	
	options = {
		project: mergeOptionalArrays( options.project, configFileOptions.project ).pop(),
		includes: mergeOptionalArrays( options.includes, configFileOptions.includes ),
		excludes: mergeOptionalArrays( options.excludes, configFileOptions.excludes ),
		reporters: mergeOptionalArrays( options.reporters, configFileOptions.reporters )
	};
}

slimCover( options );