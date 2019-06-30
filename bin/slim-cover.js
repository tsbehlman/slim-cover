#!/usr/bin/env node

const slimCover = require( "../src/shell" );
const getArgs = require( "mri" );

const args = getArgs( process.argv.slice( 2 ) );

function sanitizeStringArg( arg = [] ) {
	if( arg.constructor === String ) {
		return [ arg ];
	}
	
	return arg;
}

const options = {
	project: sanitizeStringArg( args.project ).pop(),
	includes: sanitizeStringArg( args.include ),
	excludes: sanitizeStringArg( args.exclude ),
	reporters: sanitizeStringArg( args.reporter ).map( reporter => {
		const [ type, destination ] = reporter.split( "," );
		return { type, destination };
	} )
};

slimCover( options );