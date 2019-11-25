const { relative } = require( "path" );
const lineCoverageConverter = require( "./lineCoverageConverter" );

module.exports = function( coverageData, options, outputStream ) {
	const coverage = {};
	
	for( const file of coverageData ) {
		const fileName = relative( options.project, file.name );
		coverage[ fileName ] = lineCoverageConverter( file.statements )
			.map( line => {
				const { numStatements = 0, numCoveredStatements = 0 } = line || {};
				if( numStatements === 0 ) {
					return null;
				}
				else if( numCoveredStatements === numStatements ) {
					return numStatements;
				}
				else if( numCoveredStatements === 0 ) {
					return 0;
				}
				else {
					return numCoveredStatements + "/" + numStatements;
				}
			} );
	}
	
	outputStream.write( JSON.stringify( { coverage } ) );
};