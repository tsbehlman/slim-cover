const fs = require( "fs" );

function checkModule( module ) {
	try {
		require.resolve( module );
	}
	catch( error ) {
		throw new Error( `In order to run these tests you must install "${module}" via npm` );
	}
}

module.exports = function( baseDir, coveredPaths ) {
	const runners = [
		{
			module: "jasmine",
			adapter: "Jasmine",
			specDir: "spec"
		}
	];
	
	for( let runner of runners ) {
		const specDir = baseDir + "/" + runner.specDir;
	
		try {
			fs.accessSync( specDir );
		}
		catch( error ) {
			continue;
		}
		
		checkModule( runner.module );
		
		require( `./${runner.adapter}Coverage.js` )( baseDir, specDir, coveredPaths );
		break;
	}
}