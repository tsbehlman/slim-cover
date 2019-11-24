const { relative } = require( "path" );

module.exports = function( coverageData, options, outputStream ) {
	const coverage = {};
	
	for( const file of coverageData ) {
		const lines = [ null ];
		
		let statementIndex = 0;
		
		while( statementIndex < file.statements.length ) {
			let numStatements = 0;
			let numCoveredStatements = 0;
			
			for( ; statementIndex < file.statements.length; statementIndex++ ) {
				const statement = file.statements[ statementIndex ];
			
				if( statement.start.line !== lines.length ) {
					break;
				}
			
				numStatements++;
			
				if( statement.isCovered ) {
					numCoveredStatements++;
				}
			}
			
			if( numStatements === 0 ) {
				lines.push( null );
			}
			else if( numCoveredStatements === numStatements ) {
				lines.push( numStatements );
			}
			else if( numCoveredStatements === 0 ) {
				lines.push( 0 );
			}
			else {
				lines.push( numCoveredStatements + "/" + numStatements );
			}
		}
		
		const fileName = relative( options.project, file.name );
		coverage[ fileName ] = lines;
	}
	
	outputStream.write( JSON.stringify( { coverage } ) );
};