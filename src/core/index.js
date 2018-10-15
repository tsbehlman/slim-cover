const Module = require( "module" );
const fs = require( "fs" );
const instrumentCode = require( "./Instrumenter" );

module.exports = function( coverageData, coveredPaths ) {
	function instrumentJS( module, fileName ) {
		module.coverageData = ( module.parent && module.parent.coverageData ) || coverageData;
		module.coveredPaths = ( module.parent && module.parent.coveredPaths ) || coveredPaths;
		let content = fs.readFileSync( fileName, "utf8" );
		if( module.coveredPaths.some( ( coveredPath ) => fileName.startsWith( coveredPath ) ) ) {
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