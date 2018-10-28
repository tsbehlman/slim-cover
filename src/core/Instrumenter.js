const Acorn = require( "acorn" );
const Traveler = require( "traveler" );
const Transformer = require( "transformer" );

const nestedExpressionTypes = new Set( [
	"LogicalExpression",
	"ConditionalExpression"
] );

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

function instrumentCode( source, fileName, coverageData ) {
	let statementCounter = 0;
	let statements = [];
	let fileIndex = coverageData.findIndex( file => file.name === fileName );

	if( fileIndex < 0 ) {
		fileIndex = coverageData.length;
		coverageData.push( {
			name: fileName,
			source: source,
			statements: statements
		} );
	}

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
		case "IfStatement":
			normalizeBlockStatement( node.consequent, transformer );
			if( node.alternate !== null && node.alternate.type !== "IfStatement" ) {
				normalizeBlockStatement( node.alternate, transformer );
			}
			break;
		case "WithStatement":
		case "WhileStatement":
		case "DoWhileStatement":
		case "ForStatement":
		case "ForInStatement":
		case "ForOfStatement":
			normalizeBlockStatement( node.body, transformer );
			if( node.type === "ForStatement" && node.init !== null ) {
				node.init.type = "";
			}
			else if( node.type === "ForInStatement" || node.type === "ForOfStatement" ) {
				if( node.left.type === "VariableDeclaration" ) {
					node.left.type = "";
				}
			}
			break;
		case "LogicalExpression":
			if( !nestedExpressionTypes.has( node.left.type ) ) {
				node.left.type += "Covered";
			}
			if( !nestedExpressionTypes.has( node.right.type ) ) {
				node.right.type += "Covered";
			}
			break;
		case "ConditionalExpression":
			if( !nestedExpressionTypes.has( node.consequent.type ) ) {
				node.consequent.type += "Covered";
			}
			if( !nestedExpressionTypes.has( node.alternate.type ) ) {
				node.alternate.type += "Covered";
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

function normalizeBlockStatement( node, transformer ) {
	if( node !== null && node.type !== "BlockStatement" ) {
		transformer.writeAt( "{", node.start );
		transformer.writeAt( "}", node.end );
	}
}

module.exports = instrumentCode;
module.exports.CoverageUtilities = "function __$cover(f,s){return module.coverageData[f].statements[s].isCovered=true;}";