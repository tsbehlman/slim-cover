const mockery = require( "mockery" );

const JasmineCoveragePath = require.resolve( "../../src/shell/JasmineCoverage.js" );

describe( "JasmineCoverage", () => {	
	let jasmineArguments;
	let onCompleteCallback;
	let jasmineMock;
	let MockJasmine;
	
	beforeEach( () => {
		mockery.enable( {
			useCleanCache: true,
			warnOnUnregistered: false
		} );
		
		MockJasmine = function( args ) {
			jasmineArguments = args;
			
			return jasmineMock;
		};
		MockJasmine.prototype.loadConfigFile = jasmine.createSpy( "MockJasmine.loadConfigFile" );
		MockJasmine.prototype.onComplete = ( callback ) => onCompleteCallback = callback;
		MockJasmine.prototype.loadSpecs = () => {};
		MockJasmine.prototype.execute = jasmine.createSpy( "MockJasmine.execute" ).and.callFake( function() {
			MockJasmine.prototype.loadSpecs.call( this );
		} );
		jasmineMock = new MockJasmine();
	} );

	afterEach( () => {
		mockery.deregisterAll();
		mockery.disable();
	} );
	
	function verify( baseDir, specDir, coveredPaths, specFiles ) {
		const instrumentedRequireSpy = jasmine.createSpy( "instrumentedRequireSpy" );
		const CoreSpy = jasmine.createSpy( "CoreSpy" ).and.returnValue( instrumentedRequireSpy );
		const PrinterSpy = jasmine.createSpy( "PrinterSpy" );
		mockery.registerMock( "jasmine", MockJasmine );
		mockery.registerMock( "../core", CoreSpy );
		mockery.registerMock( "./TerminalPrinter.js", PrinterSpy );
		
		jasmineMock.specFiles = specFiles;
		
		require( JasmineCoveragePath )( baseDir, specDir, coveredPaths );
		
		expect( jasmineArguments ).toEqual( {
			projectBaseDir: baseDir
		} );
		expect( jasmineMock.loadConfigFile ).toHaveBeenCalledWith( specDir + "/support/jasmine.json" );
		expect( jasmineMock.execute ).toHaveBeenCalled();
		expect( CoreSpy ).toHaveBeenCalledWith( [], coveredPaths );
		expect( instrumentedRequireSpy.calls.allArgs() ).toEqual( specFiles.map( ( file ) => [ file ] ) );
	}
	
	it( "executes no Jasmine tests", () => {
		verify( ".", "./spec", [ "src" ], [] );
	} );
	
	it( "executes some Jasmine tests", () => {
		verify( "..", "../tests", [ "../tests/build" ], [ "test1.js", "test2.js" ] );
	} );
} );