global.__$coverage = new Map();

const requireForCoverage = require( "./CoverageModule" );

module.exports = function( fileName ) {
	requireForCoverage( fileName );
	
	return __$coverage;
}