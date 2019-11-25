function addStatementToLine( lines, lineNumber, statement ) {
	for( let i = lines.length; i <= lineNumber; i++ ) {
		lines[ i ] = {
			numStatements: 0,
			numCoveredStatements: 0
		};
	}
	
	const line = lines[ lineNumber ];
	
	line.numStatements++;
	
	if( statement.isCovered ) {
		line.numCoveredStatements++;
	}
}

module.exports = function( statements ) {
	const lines = [ null ];
	
	for( const statement of statements ) {
		for( let lineNumber = statement.start.line; lineNumber <= statement.end.line; lineNumber++ ) {
			addStatementToLine( lines, lineNumber, statement );
		}
	}
	
	return lines;
};