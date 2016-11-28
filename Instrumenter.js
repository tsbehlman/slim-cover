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

function markStatementAsCovered(fileIndex, statementIndex) {
	return `__$cover(${fileIndex},${statementIndex});`;
}

function addExpressionToStatements( node, fileIndex, statements ) {
	node.update( `(function() {${markStatementAsCovered(fileIndex, statements.length)} return ${node.source()};}).call(this)` );
	addNodeToStatements( node, statements );
}

function instrumentCode( source, fileName ) {
	let statementCounter = 0;
	let statements = [];
	let fileIndex = __$coverage.length;

	__$coverage.push( {
		name: fileName,
		source: source,
		statements: statements
	} );
	
	return Falafel( source, {
		loc: true,
		range: true
	}, ( node ) => {
		switch( node.type ) {
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
			node.update( `${markStatementAsCovered(fileIndex, statementCounter)} ${node.source()}` );
			addNodeToStatements( node, statements, statementCounter );
			statementCounter++;
			break;
		case "LogicalExpression":
			if( node.left.type !== "LogicalExpression" ) {
				addExpressionToStatements( node.left, fileIndex, statements );
				statementCounter++;
			}
			if( node.right.type !== "LogicalExpression" ) {
				addExpressionToStatements( node.right, fileIndex, statements );
				statementCounter++;
			}
			break;
		case "ConditionalExpression":
			addExpressionToStatements( node.consequent, fileIndex, statements );
			statementCounter++;
			addExpressionToStatements( node.alternate, fileIndex, statements );
			statementCounter++;
			break;
		case "IfStatement":
		case "WhileStatement":
		case "DoWhileStatement":
		case "ForStatement":
		case "ForInStatement":
		case "WithStatement":
			let body = node.consequent !== undefined ? node.consequent : node.body;
			let alternate = node.alternate;
			if( alternate && alternate.type !== "BlockStatement" ) {
				alternate.update( `{${alternate.source()}}` );
			}
			if( body.type !== "BlockStatement" ) {
				body.update( `{${body.source()}}` );
			}
			break;
		}
	} );
}

module.exports = instrumentCode;