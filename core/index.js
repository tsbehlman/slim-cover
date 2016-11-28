global.__$coverage = new Array();
global.__$cover = function( fileIndex, statementIndex ) {
	__$coverage[ fileIndex ].statements[ statementIndex ].isCovered = true;
};

const requireForCoverage = require( "./CoverageModule" );

module.exports = function( fileName ) {
	requireForCoverage( fileName );
	
	return __$coverage;
}