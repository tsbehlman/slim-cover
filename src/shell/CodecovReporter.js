const { relative } = require( "path" );
const lineCoverageConverter = require( "./lineCoverageConverter" );

module.exports = function( coverageData, project, options, outputStream ) {
	const coverage = {};
	
	for( const file of coverageData ) {
		const fileName = relative( project, file.name );
		coverage[ fileName ] = lineCoverageConverter( file.statements )
			.map( line => {
				const { numStatements = 0, numCoveredStatements = 0 } = line || {};
				let coverage = numCoveredStatements;
				
				if( numStatements === 0 ) {
					coverage = null;
				}
				else if( numCoveredStatements !== numStatements ) {
					coverage += "/" + numStatements;
				}
				
				return coverage;
			} );
	}
	
	outputStream.write( JSON.stringify( { coverage } ) );
};