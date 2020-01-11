const path = require( "path" );
const { createWriteStream } = require( "fs" );

const reporterLocationForType = new Map( [
	[ "terminal", "./TerminalReporter.js" ],
	[ "codecov", "./CodecovReporter.js" ]
] );

module.exports = function( { project = ".", includes = [], excludes = [], reporters = [] } ) {
	project = path.resolve( project );

	if( includes.length === 0 ) {
		includes = [ project ];
	}
	else {
		includes = includes.map( include => path.resolve( include ) );
	}

	excludes = excludes.map( exclude => path.resolve( exclude ) );

	if( reporters.length === 0 ) {
		reporters = [ {} ];
	}
	
	reporters = reporters.map( makeReporter );

	return {
		project,
		includes,
		excludes,
		reporters
	};
};

function makeReporter( { type = "terminal", options = {}, destination } ) {
	let reporterLocation = reporterLocationForType.get( type );
	let destinationStream = process.stdout;
	if( destination !== undefined ) {
		destinationStream = createWriteStream( destination );
	}
	
	return {
		type,
		reporter: require( reporterLocation ),
		options,
		destination: destinationStream
	};
}