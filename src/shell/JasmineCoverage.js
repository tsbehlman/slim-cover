const Jasmine = require( "jasmine" );
const Core = require( "../core" );
const printCoverage = require( "./TerminalPrinter.js" );

module.exports = function( baseDir, specDir, options ) {
	const configFile = specDir + "/support/jasmine.json";
	
	const jasmine = new Jasmine( {
		projectBaseDir: baseDir
	} );
	
	jasmine.loadConfigFile( configFile );
	
	const coverageData = [];
	const requireForCoverage = Core( coverageData, options );
	
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