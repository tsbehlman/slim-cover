if( process.argv.length < 3 ) {
	console.log( "Specify a spec folder to execute." );
	return;
}

const getCoverage = require( "./core" );
const printCoverage = require( "./shell" );
const Jasmine = require( "jasmine" );

let jasmine = new Jasmine();
jasmine.loadConfig({
	spec_dir: process.argv[2],
	spec_files: [
		"**/*[Ss]pec.js",
	]
});

Jasmine.prototype.loadSpecs = function() {
	for( let specFile of this.specFiles ) {
		getCoverage( specFile );
	}
};

jasmine.onComplete( function(passed) {
	if (passed) {
		printCoverage( __$coverage, process.stdout );
	}
} );

jasmine.execute();