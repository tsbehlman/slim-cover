require.cache[ require.resolve( "../src/core" ) ] = undefined;
const Core = require( "../src/core" );
const fs = require( "fs" );

function requireForCoverage( coverageData, coveredPaths, requiredFile ) {
	coveredPaths = coveredPaths.map( ( path ) => fs.realpathSync( path ) );
	return Core( coverageData, coveredPaths )( requiredFile );
}

function verify( coveredPaths, requiredFile, expectedCoveredStatements, expectedTotalStatements ) {
	const coverageData = [];
	requireForCoverage( coverageData, coveredPaths, requiredFile );

	const allStatements = coverageData.reduce( ( statements, file ) => statements.concat( file.statements ), [] );
	expect( allStatements.length ).toBe( expectedTotalStatements );

	const actualCoveredStatements = allStatements.filter( ( statement ) => statement.isCovered ).length;
	expect( actualCoveredStatements ).toBe( expectedCoveredStatements );
}

describe( "Core", () => {
	it( "instruments a leaf module and deems it fully covered", () => {
		verify( [ "spec/artifacts" ], "./spec/artifacts/CoveredLeafModule.js", 1, 1 );
	} );

	it( "instruments a leaf module and deems it uncovered", () => {
		verify( [ "spec/artifacts" ], "./spec/artifacts/UncoveredLeafModule.js", 0, 1 );
	} );

	it( "instruments a parent module and deems it fully covered", () => {
		verify( [ "spec/artifacts" ], "./spec/artifacts/CoveredParentModule.js", 2, 2 );
	} );

	it( "instruments a parent module but not its child", () => {
		verify( [ "./spec/artifacts/CoveredParentIgnoredChildModule.js" ], "./spec/artifacts/CoveredParentIgnoredChildModule.js", 1, 1 );
	} );

	it( "successfully loads json file", () => {
		expect( requireForCoverage( [], [ "." ], "./spec/artifacts/NonJSFile.json" ) ).toEqual( { value: 42 } );
	} );

	it( "successfully loads native module", () => {
		expect( requireForCoverage( [], [ "." ], "fs" ) ).toBe( fs );
	} );
} );