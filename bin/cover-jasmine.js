const Jasmine = require( "jasmine" );
const getCoverage = require( "../core" );
const printCoverage = require( "../shell" );

module.exports = function( baseDir, specDir ) {
	let configFile = specDir + "/support/jasmine.json";
	
	let jasmine = new Jasmine( {
		projectBaseDir: baseDir
	} );
	
	jasmine.loadConfigFile( configFile );
	
	Jasmine.prototype.loadSpecs = function() {
		for( let specFile of this.specFiles ) {
			getCoverage( specFile );
		}
	};
	
	jasmine.onComplete( function( passed ) {
		if( passed ) {
			printCoverage( __$coverage, process.stdout );
		}
	} );
	
	jasmine.execute();
};