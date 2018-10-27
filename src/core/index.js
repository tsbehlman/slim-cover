const Module = require( "module" );
const fs = require( "fs" );
const instrumentCode = require( "./Instrumenter" );

function hasPrefix( fileName ) {
	return function( prefix ) {
		return fileName.startsWith( prefix );
	}
}

module.exports = function( coverageData, coverageOptions ) {
	function instrumentJS( module, fileName ) {
		module.coverageData = ( module.parent && module.parent.coverageData ) || coverageData;
		module.coverageOptions = ( module.parent && module.parent.coverageOptions ) || coverageOptions;
		let content = fs.readFileSync( fileName, "utf8" );
		const { includes, excludes } = module.coverageOptions;
		if( includes.some( hasPrefix( fileName ) ) && !excludes.some( hasPrefix( fileName ) ) ) {
			content = instrumentCode( content, fileName, module.coverageData );
			content += "\n" + instrumentCode.CoverageUtilities;
		}
		module._compile( content, fileName );
	};
	
	Module._extensions[ ".js" ] = instrumentJS;
	
	return function( request ) {
		return Module._load( request, null, false );
	};
};