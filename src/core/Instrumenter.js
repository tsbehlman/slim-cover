const Acorn = require( "acorn" );
const Traveler = require( "../../lib/traveler" );
const Transformer = require( "../../lib/transformer" );

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
	const statements = [];
	let fileIndex = coverageData.findIndex( file => file.name === fileName );
	const nodesToIgnore = new Set();
	const expressionsToCover = new Set();

	if( fileIndex < 0 ) {
		fileIndex = coverageData.length;
		coverageData.push( {
			name: fileName,
			source: source,
			statements: statements
		} );
	}

	const ast = Acorn.parse( source, {
		locations: true,
		allowImportExportEverywhere: true
	} );

	const transformer = new Transformer( source );

	for( const node of new Traveler( ast ) ) {
		if( nodesToIgnore.has( node ) ) {
			nodesToIgnore.delete( node )
			continue;
		}
		
		if( expressionsToCover.has( node ) ) {
			expressionsToCover.delete( node );
			addExpressionToStatements( node, fileIndex, statements, transformer );
			statementCounter++;
		}
		
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
				nodesToIgnore.add( node.init );
			}
			else if( node.type === "ForInStatement" || node.type === "ForOfStatement" ) {
				if( node.left.type === "VariableDeclaration" ) {
					nodesToIgnore.add( node.left );
				}
			}
			break;
		case "LogicalExpression":
			if( !nestedExpressionTypes.has( node.left.type ) ) {
				expressionsToCover.add( node.left );
			}
			if( !nestedExpressionTypes.has( node.right.type ) ) {
				expressionsToCover.add( node.right );
			}
			break;
		case "ConditionalExpression":
			if( !nestedExpressionTypes.has( node.consequent.type ) ) {
				expressionsToCover.add( node.consequent );
			}
			if( !nestedExpressionTypes.has( node.alternate.type ) ) {
				expressionsToCover.add( node.alternate );
			}
			break;
		case "ArrowFunctionExpression":
			if( node.body.type !== "BlockStatement" ) {
				expressionsToCover.add( node.body );
			}
			break;
		case "SwitchCase":
			let end = "default".length;
			if( node.test !== null ) {
				end = node.test.end
			}
			end = source.indexOf( ":", end ) + 1;
			transformer.writeAt( markStatementAsCovered(fileIndex, statementCounter) + ";", end );
			addNodeToStatements( {
				start: node.start,
				end: end,
				loc: {
					start: node.loc.start,
					end: {
						line: node.loc.start.line,
						column: node.loc.start.column + end - node.start
					}
				}
			}, statements, statementCounter );
			statementCounter++;
			break;
		case "ExportNamedDeclaration":
			if (node.declaration !== null) {
				nodesToIgnore.add( node.declaration );
			}
			break;
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