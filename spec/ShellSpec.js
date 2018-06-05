const mockery = require( "mockery" );

describe( "Shell", () => {
	beforeEach( () => {
		mockery.enable( {
			useCleanCache: true,
			warnOnUnregistered: false
		} );
	} );
	
	afterEach( () => {
		mockery.deregisterAll();
		mockery.disable();
	} );
	
	it( "sees Jasmine tests and calls the Jasmine adapter", () => {
		const JasmineCoverageSpy = jasmine.createSpy( "JasmineCoverage" );
		mockery.registerMock( "fs", { accessSync: ( path ) => {} } );
		mockery.registerMock( "./JasmineCoverage.js", JasmineCoverageSpy );
		
		require( "../src/shell" )( ".", [ "." ] );
		
		expect( JasmineCoverageSpy ).toHaveBeenCalledWith( ".", "./spec", [ "." ] );
	} );
	
	it( "sees no Jasmine tests and does nothing", () => {
		const JasmineCoverageSpy = jasmine.createSpy( "JasmineCoverage" );
		mockery.registerMock( "fs", { accessSync: ( path ) => {
			throw new Error();
		} } );
		mockery.registerMock( "./JasmineCoverage.js", JasmineCoverageSpy );
		
		require( "../src/shell" )( ".", [ "." ] );
		
		expect( JasmineCoverageSpy ).not.toHaveBeenCalled();
	} );
	
	it( "", () => {
		
	} );
} );