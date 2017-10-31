const Core = require( "../src/core" );
const CoverageModule = require( "../src/core/CoverageModule" );

describe( "Core", () => {
	it( "redirects to the CoverageModule require function factory", () => {
		expect( Core ).toBe( CoverageModule.makeRequireFunction );
	} );
} );