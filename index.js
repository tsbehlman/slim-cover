let Falafel = require( "falafel-harmony" );
let Module = require( "module" );
let vm = require( "vm" );
let fs = require( "fs" );
var path = require( "path" );

class CoverageModule extends Module {
	constructor( fileName, parent ) {
		super( fileName, parent );
	}
	
	load( fileName ) {
		this.filename = fileName;
		this.paths = Module._nodeModulePaths(path.dirname(fileName));
		this.loaded = true;
	}
}

let moduleCache = new Map();

function createRequireForParent( parentModule ) {
	return (function( module, createRequireForParent ) {
		return function( fileName ) {
			fileName = Module._resolveFilename( fileName, module );
			let newModule = moduleCache.get( fileName );
			if( newModule === undefined ) {
				let source = fs.readFileSync( fileName ).toString();
				source = instrumentCode( source, fileName );
				source = Module.wrap( source );
				let wrapper = vm.runInNewContext( source, context );
				newModule = new Module( fileName, module );
				newModule.load( fileName );
				wrapper.call( newModule.exports, newModule.exports, createRequireForParent( newModule ), newModule, fileName, path.dirname( fileName ) );
				moduleCache.set( fileName, newModule );
			}
			return newModule.exports;
		}
	})( parentModule, createRequireForParent );
}

let context = {
	__$coverage: {
		files: new Map()
	},
	console: console
};

function instrumentCode( source, fileName ) {
	let statementCounter = 0;
	let statements = [];
	
	context.__$coverage.files.set( fileName, {
		source: source,
		statements: statements
	} );
	
	return Falafel( source, {
		loc: true,
		range: true
	}, ( node ) => {
		switch( node.type ) {
		case "Program":
			node.update( `let __$statements = __$coverage.files.get("${fileName}").statements;\n${node.source()}` );
			break;
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
			statements[ statementCounter ] = {
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
			};
			node.update( `__$statements[${statementCounter}].isCovered = true; ${node.source()}` );
			statementCounter++;
			break;
		}
	} );
}

module.exports = function( fileName ) {
	createRequireForParent( null )( fileName );
	
	return context.__$coverage.files;
}