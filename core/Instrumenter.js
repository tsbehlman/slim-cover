const Acorn = require( "acorn" );
const Traveler = require( "../lib/traveler" );
const Transformer = require( "../lib/transformer" );

function addNodeToStatements( node, statements ) {
	statements.push( {
		start: {
			index: node.start,
			line: node.loc.start.line,
			column: node.loc.start.column
		},
		end: {
			index: node.end,
			line: node.loc.end.line,
			column: node.loc.end.column
		},
		isCovered: false
	} );
}

function markStatementAsCovered(fileIndex, statementIndex) {
	return `__$cover(${fileIndex},${statementIndex})`;
}

function addExpressionToStatements( node, fileIndex, statements, transformer ) {
	transformer.writeAt( `(${markStatementAsCovered(fileIndex, statements.length)}&&(`, node.start );
	transformer.writeAt( "))", node.end );
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

	let ast = Acorn.parse( source, {
		locations: true
	} );

	let transformer = new Transformer( source );

	for( let node of new Traveler( ast ) ) {
		switch( node.type ) {
		case "ExpressionStatement":
		case "DebuggerStatement":
		case "ReturnStatement":
		case "BreakStatement":
		case "ContinueStatement":
		case "ThrowStatement":
		case "VariableDeclaration":
			transformer.writeAt( markStatementAsCovered(fileIndex, statementCounter) + ";", node.start );
			addNodeToStatements( node, statements, statementCounter );
			statementCounter++;
			break;
		case "LogicalExpression":
			if( node.left.type !== "LogicalExpression" ) {
				node.left.type += "Covered";
			}
			if( node.right.type !== "LogicalExpression" ) {
				node.right.type += "Covered";
			}
			break;
		case "ConditionalExpression":
			node.consequent.type += "Covered";
			node.alternate.type += "Covered";
			break;
		case "ForInStatement":
		case "ForOfStatement":
			if( node.left.type === "VariableDeclaration" ) {
				node.left.type = "";
			}
		case "IfStatement":
		case "WhileStatement":
		case "DoWhileStatement":
		case "ForStatement":
		case "WithStatement":
			let body = node.consequent !== undefined ? node.consequent : node.body;
			let alternate = node.alternate;
			if( alternate && alternate.type !== "BlockStatement" ) {
				transformer.writeAt( "{", alternate.start );
				transformer.writeAt( "}", alternate.end );
			}
			if( body.type !== "BlockStatement" ) {
				transformer.writeAt( "{", body.start );
				transformer.writeAt( "}", body.end );
			}
			if( node.type === "ForStatement" && node.init !== null ) {
				node.init.type = "";
			}
			break;
		}
		
		if( node.type.endsWith( "Covered" ) ) {
			addExpressionToStatements( node, fileIndex, statements, transformer );
			statementCounter++;
		}
	}

	return transformer.getSource();
}

module.exports = instrumentCode;