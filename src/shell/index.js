const fs = require( "fs" );
const configure = require( "./Configuration.js" );

function checkModule( module ) {
	try {
		require.resolve( module );
	}
	catch( error ) {
		throw new Error( `In order to run these tests you must install "${module}" via npm` );
	}
}

module.exports = function( options ) {
	options = configure( options );
	
	const coverageData = [];
	
	function generateReport() {
		for( const { module, destination } of options.reporters ) {
			module( coverageData, destination );
		}
	}
	
	const runners = [
		{
			module: "jasmine",
			adapter: "Jasmine",
			specDir: "spec"
		}
	];
	
	for( let runner of runners ) {
		const specDir = options.project + "/" + runner.specDir;
	
		try {
			fs.accessSync( specDir );
		}
		catch( error ) {
			continue;
		}
		
		checkModule( runner.module );
		
		require( `./${runner.adapter}Coverage.js` )( options.project, specDir, coverageData, options, generateReport );
		break;
	}
}