global.__$coverage = {
	files: new Map()
};

let requireForCoverage = require( "./CoverageModule" );

module.exports = function( fileName ) {
	requireForCoverage( fileName );
	
	return __$coverage.files;
}