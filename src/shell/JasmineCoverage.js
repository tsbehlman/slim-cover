const Jasmine = require( "jasmine" );
const Core = require( "../core" );

module.exports = function( baseDir, specDir, coverageData, options, generateReport ) {
	const configFile = specDir + "/support/jasmine.json";
	
	const jasmine = new Jasmine( {
		projectBaseDir: baseDir
	} );
	
	jasmine.loadConfigFile( configFile );
	
	const requireForCoverage = Core( coverageData, options );
	
	Jasmine.prototype.loadSpecs = function() {
		for( let specFile of this.specFiles ) {
			requireForCoverage( specFile );
		}
	};
	
	jasmine.onComplete( function( passed ) {
		if( passed ) {
			generateReport();
		}
	} );
	
	jasmine.execute();
};