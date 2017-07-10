const Jasmine = require( "jasmine" );
const makeRequireForCoverage = require( "../src/core" );
const printCoverage = require( "../src/shell" );

module.exports = function( baseDir, specDir ) {
	let configFile = specDir + "/support/jasmine.json";
	
	let jasmine = new Jasmine( {
		projectBaseDir: baseDir
	} );
	
	jasmine.loadConfigFile( configFile );
	
	let coverageData = [];
	let requireForCoverage = makeRequireForCoverage( null, coverageData );
	
	Jasmine.prototype.loadSpecs = function() {
		for( let specFile of this.specFiles ) {
			requireForCoverage( specFile );
		}
	};
	
	jasmine.onComplete( function( passed ) {
		if( passed ) {
			printCoverage( coverageData, process.stdout );
		}
	} );
	
	jasmine.execute();
};