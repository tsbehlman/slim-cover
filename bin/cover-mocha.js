const fs = require( "fs" );
const Module = require( "module" );
const Mocha = require( "mocha" );
const getCoverage = require( "../core" );
const printCoverage = require( "../shell" );

module.exports = function( baseDir, testDir ) {
	const mocha = new Mocha();
	
	for( let file of fs.readdirSync( testDir ) ) {
		mocha.addFile( testDir + "/" + file );
	}
	
	mocha.suite.on( "pre-require", ( global, fileName, mocha ) => {
		Module._cache[ fileName ] = getCoverage( fileName );
	} );
	
	mocha.run( ( failures ) => {
		if( failures === 0 ) {
			printCoverage( __$coverage, process.stdout );
		}
	} );
};