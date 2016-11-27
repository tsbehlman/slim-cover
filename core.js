global.__$coverage = new Map();
global.__$cover = function( fileName, statementIndex ) {
	__$coverage.get( fileName ).statements[ statementIndex ].isCovered = true;
};

const requireForCoverage = require( "./CoverageModule" );

module.exports = function( fileName ) {
	requireForCoverage( fileName );
	
	return __$coverage;
}