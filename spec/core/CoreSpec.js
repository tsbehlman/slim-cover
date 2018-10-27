require.cache[ require.resolve( "../../src/core" ) ] = undefined;
const Core = require( "../../src/core" );
const path = require( "path" );

function requireForCoverage( coverageData, includes, excludes, requiredFile ) {
	includes = includes.map( include => path.resolve( include ) );
	excludes = excludes.map( exclude => path.resolve( exclude ) );
	return Core( coverageData, { includes, excludes } )( requiredFile );
}

function verify( includes, excludes, requiredFile, expectedCoveredStatements, expectedTotalStatements ) {
	const coverageData = [];
	requireForCoverage( coverageData, includes, excludes, requiredFile );

	const allStatements = coverageData.reduce( ( statements, file ) => [ ...statements, ...file.statements ], [] );
	expect( allStatements.length ).toBe( expectedTotalStatements );

	const actualCoveredStatements = allStatements.filter( statement => statement.isCovered ).length;
	expect( actualCoveredStatements ).toBe( expectedCoveredStatements );
}

describe( "Core", () => {
	it( "instruments a leaf module and deems it fully covered", () => {
		verify( [ "spec/artifacts" ], [], "./spec/artifacts/CoveredLeafModule.js", 1, 1 );
	} );

	it( "instruments a leaf module and deems it uncovered", () => {
		verify( [ "spec/artifacts" ], [], "./spec/artifacts/UncoveredLeafModule.js", 0, 1 );
	} );

	it( "instruments a parent module and deems it fully covered", () => {
		verify( [ "spec/artifacts" ], [], "./spec/artifacts/CoveredParentModule.js", 2, 2 );
	} );

	it( "instruments a parent module but not its unincluded child", () => {
		verify( [ "./spec/artifacts/CoveredParentIgnoredChildModule.js" ], [], "./spec/artifacts/CoveredParentIgnoredChildModule.js", 1, 1 );
	} );
	
	it( "does not instrument an excluded parent module but does instrument its included child", () => {
		verify( [ "./spec/artifacts/" ], [ "./spec/artifacts/ExcludedParentModule.js" ], "./spec/artifacts/ExcludedParentModule.js", 1, 1 );
	} );

	it( "successfully loads json file", () => {
		expect( requireForCoverage( [], [ "." ], [], "./spec/artifacts/NonJSFile.json" ) ).toEqual( { value: 42 } );
	} );

	it( "successfully loads native module", () => {
		expect( requireForCoverage( [], [ "." ], [], "path" ) ).toBe( path );
	} );
} );