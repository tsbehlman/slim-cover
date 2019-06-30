const path = require( "path" );
const { createWriteStream } = require( "fs" );

const moduleNameForReporter = new Map( [
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
		reporters = [ {
			name: "terminal",
			module: require( moduleNameForReporter.get( "terminal" ) ),
			destination: process.stdout
		} ];
	}
	else {
		reporters = reporters.map( ( { name = "terminal", destination } ) => ( {
			name,
			module: require( moduleNameForReporter.get( name ) ),
			destination: destination === undefined ? process.stdout : createWriteStream( destination )
		} ) );
	}

	return {
		project,
		includes,
		excludes,
		reporters
	};
};