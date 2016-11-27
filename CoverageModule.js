const Module = require( "module" );
const path = require( "path" );
const vm = require( "vm" );
const fs = require( "fs" );
const instrumentCode = require( "./Instrumenter" );

class CoverageModule extends Module {
	constructor( fileName, parent ) {
		super( fileName, parent );
	}

	load( fileName ) {
		if( path.extname( fileName ) === ".js" ) {
			this.filename = fileName;
			this.paths = Module._nodeModulePaths(path.dirname(fileName));
			
			let content = fs.readFileSync( fileName ).toString();
			if( this.parent !== null ) {
				content = instrumentCode( content, fileName );
			}
			
			this._compile( content, fileName );
			this.loaded = true;
		}
		else {
			super.load( fileName );
		}
	}
	
	_compile( content, fileName ) {
		content = Module.wrap( content );
		let wrapper = vm.runInThisContext( content, {
			filename: fileName,
			lineOffset: 0,
			displayErrors: true
		} );
		return wrapper.call( this.exports, this.exports, CoverageModule.makeRequireFunction( this ), this, fileName, path.dirname( fileName ) );
	}
}

CoverageModule._load = function( fileName, parent ) {
	fileName = Module._resolveFilename( fileName, parent );
	let newModule = moduleCache.get( fileName );
	if( newModule === undefined ) {
		newModule = new CoverageModule( fileName, parent );
		newModule.load( fileName );
		moduleCache.set( fileName, newModule );
	}
	return newModule.exports;
};

let moduleCache = new Map();

CoverageModule.makeRequireFunction = function( parentModule ) {
	return function( fileName ) {
		return CoverageModule._load( fileName, parentModule );
	}
};

module.exports = CoverageModule.makeRequireFunction( null );