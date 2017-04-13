const fs = require( "fs" );
const Module = require( "module" );
const Mocha = require( "mocha" );
const makeRequireForCoverage = require( "../core" );
const printCoverage = require( "../shell" );

module.exports = function( baseDir, testDir ) {
	const mocha = new Mocha();
	
	for( let file of fs.readdirSync( testDir ) ) {
		mocha.addFile( testDir + "/" + file );
	}
	
	let coverageData = [];
	let requireForCoverage = makeRequireForCoverage( null, coverageData );
	
	mocha.suite.on( "pre-require", ( global, fileName, mocha ) => {
		Module._cache[ fileName ] = requireForCoverage( fileName );
	} );
	
	mocha.run( ( failures ) => {
		if( failures === 0 ) {
			printCoverage( coverageData, process.stdout );
		}
	} );
};