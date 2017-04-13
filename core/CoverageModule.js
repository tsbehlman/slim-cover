const Module = require( "module" );
const path = require( "path" );
const vm = require( "vm" );
const fs = require( "fs" );
const instrumentCode = require( "./Instrumenter" );

class CoverageModule extends Module {
	constructor( fileName, parent, coverageData ) {
		super( fileName, parent );
		this.coverageData = coverageData;
	}

	load( fileName ) {
		if( path.extname( fileName ) === ".js" ) {
			this.filename = fileName;
			this.paths = Module._nodeModulePaths(path.dirname(fileName));
			
			let content = fs.readFileSync( fileName );
			if( this.parent !== null && fileName.indexOf("node_modules") === -1 ) {
				content = instrumentCode( content, fileName, this.coverageData );
			}
			
			this._compile( content, fileName );
			this.loaded = true;
		}
		else {
			super.load( fileName );
		}
	}
	
	_compile( content, fileName ) {
		content = CoverageModule.wrap( content );
		let wrapper = vm.runInThisContext( content, {
			filename: fileName,
			lineOffset: 0,
			displayErrors: true
		} );
		let require = CoverageModule.makeRequireFunction( this, this.coverageData );
		return wrapper.call( this.exports, this.exports, require, this, fileName, path.dirname( fileName ), this.coverageData );
	}
}

CoverageModule.wrap = function( content ) {
	return "(function (exports, require, module, __filename, __dirname, __$coverage) {" +
		"function __$cover(f,s){return __$coverage[f].statements[s].isCovered=true;}\n" +
		content +
		"\n});";
};

CoverageModule._load = function( fileName, parent, coverageData ) {
	fileName = Module._resolveFilename( fileName, parent );
	let newModule = moduleCache.get( fileName );
	if( newModule === undefined ) {
		newModule = new CoverageModule( fileName, parent, coverageData );
		moduleCache.set( fileName, newModule );
		newModule.load( fileName );
	}
	return newModule.exports;
};

let moduleCache = new Map();

CoverageModule.makeRequireFunction = function( parentModule, coverageData ) {
	return function( fileName ) {
		return CoverageModule._load( fileName, parentModule, coverageData );
	}
};

module.exports = CoverageModule;