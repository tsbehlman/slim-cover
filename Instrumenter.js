const Falafel = require( "falafel-harmony" );

function addNodeToStatements( node, statements ) {
	statements.push( {
		start: {
			index: node.range[0],
			line: node.loc.start.line,
			column: node.loc.start.column
		},
		end: {
			index: node.range[1],
			line: node.loc.end.line,
			column: node.loc.end.column
		},
		isCovered: false
	} );
}

function markStatementAsCovered(fileName, statementIndex) {
	return `__$coverage.get("${fileName}").statements[${statementIndex}].isCovered = true;`;
}

function addExpressionToStatements( node, fileName, statements ) {
	node.update( `(function() {${markStatementAsCovered(fileName, statements.length)} return ${node.source()};}).call(this)` );
	addNodeToStatements( node, statements );
}

function instrumentCode( source, fileName ) {
	let statementCounter = 0;
	let statements = [];

	__$coverage.set( fileName, {
		source: source,
		statements: statements
	} );
	
	return Falafel( source, {
		loc: true,
		range: true
	}, ( node ) => {
		switch( node.type ) {
		/*case "Program":
			node.update( `let __$statements = __$coverage.files.get("${fileName}").statements;\n${node.source()}` );
			break;*/
		case "ExpressionStatement":
		case "DebuggerStatement":
		case "ReturnStatement":
		case "BreakStatement":
		case "ContinueStatement":
		case "ThrowStatement":
		case "VariableDeclaration":
			if( node.type === "VariableDeclaration" && /For(?:Of|In)Statement/.test( node.parent.type ) ) {
				break;
			}
			node.update( `${markStatementAsCovered(fileName, statementCounter)} ${node.source()}` );
			addNodeToStatements( node, statements, statementCounter );
			statementCounter++;
			break;
		case "LogicalExpression":
			if( node.left.type !== "LogicalExpression" ) {
				addExpressionToStatements( node.left, fileName, statements );
				statementCounter++;
			}
			if( node.right.type !== "LogicalExpression" ) {
				addExpressionToStatements( node.right, fileName, statements );
				statementCounter++;
			}
			break;
		}
	} );
}

module.exports = instrumentCode;