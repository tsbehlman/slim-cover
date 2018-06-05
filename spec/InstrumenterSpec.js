require.cache[ require.resolve( "../src/core/Instrumenter" ) ] = undefined;
let instrumentCode = require( "../src/core/Instrumenter" );

let fileIndex = 0;
let statementIndex = 0;
let coverageData = [];

function verify() {
	let sourceCode = "";
	let instrumentedCode = "";
	let numStatements = 0;
	
	for( let statement of arguments ) {
		sourceCode += statement.sourceCode;
		instrumentedCode += statement.instrumentedCode;
		if( statement.isCoverable ) {
			numStatements++;
		}
	}
	
	let actualInstrumentedCode = instrumentCode( Buffer.from( sourceCode ), `test${fileIndex}.js`, coverageData );
	
	expect( actualInstrumentedCode ).toEqual( jasmine.any( Buffer ) );
	expect( actualInstrumentedCode.toString() ).toBe( instrumentedCode );
	
	let file = coverageData[ fileIndex ];
	
	expect( file.name ).toBe( `test${fileIndex}.js` );
	expect( file.source ).toEqual( jasmine.any( Buffer ) );
	expect( file.source.toString() ).toBe( sourceCode );
	
	let statements = file.statements;
	
	expect( file.statements ).toEqual( jasmine.any( Array ) );
	expect( statements.length ).toBe( numStatements );
	
	for( let i = 1; i < statements.length; i++ ) {
		expect( statements[ i - 1 ].start.index ).not.toBeGreaterThan( statements[ i ].start.index );
	}
	
	fileIndex++;
	statementIndex = 0;
}

describe( "Instrumenter", () => {
	beforeEach( () => {
		coverageData = [];
		fileIndex = 0;
		statementIndex = 0;
	} );
	
	it( "instruments a variable declaration", () => {
		verify( Statement( "var test1 = 1;" ) );
	} );
	
	it( "instruments two variable declarations", () => {
		verify( Statement( "var test1 = 1;" ), Statement( "var test2 = 2;" ) );
	} );
	
	it( "instruments a variable declaration in each of two files", () => {
		verify( Statement( "var test1 = 1;" ) );
		verify( Statement( "var test2 = 2;" ) );
	} );
	
	it( "instruments an expression statement", () => {
		verify( Statement( "1;" ) );
	} );
	
	it( "instruments a debugger statement", () => {
		verify( Statement( "debugger;" ) );
	} );
	
	it( "instruments a throw statement", () => {
		verify( Statement( "throw '';" ) );
	} );
	
	it( "does not instrument a funciton declaration", () => {
		verify( Code( "function test1(){}" ) );
	} );
	
	it( "instruments a return statement", () => {
		verify(
			Code( "function test1(){" ),
			Statement( "return 1;" ),
			Code( "}" )
		);
	} );
	
	it( "instruments a break statement", () => {
		verify(
			Code( "switch('a'){case 'a':" ),
			Statement( "break;" ),
			Code( "}" )
		);
	} );
	
	it( "instruments a continue statement", () => {
		verify(
			Code( "do {" ),
			Statement( "continue;" ),
			Code( "}while(false);" )
		);
	} );
	
	it( "adds missing braces to while", () => {
		verify( Code( "while(false)" ), BlockFix() );
	} );
	
	it( "adds missing braces to do-while", () => {
		verify( Code( "do" ), BlockFix(), Code( "while( false );" ) );
	} );
	
	it( "adds missing braces to if", () => {
		verify( Code( "if(false)" ), BlockFix() );
	} );
	
	it( "adds missing braces to else", () => {
		verify( Code( "if(false){}else" ), BlockFix() );
	} );
	
	it( "does not instrument variable declaration in for-of", () => {
		verify( Code( "for(let i of []){}" ) );
	} );
	
	it( "does not instrument variable declaration in for-in", () => {
		verify( Code( "for(let i in []){}" ) );
	} );
	
	it( "does not instrument variable declaration in for", () => {
		verify( Code( "for(let i=0;i<10;i++){}" ) );
	} );
	
	it( "instruments both sides of logical statement", () => {
		verify( Instrumentation(), Expression( "true" ), Code( "&&" ), Expression( "false" ) );
	} );
	
	it( "instruments nested logical statements", () => {
		verify(
			Instrumentation(),
			Expression( "true" ),
			Code( "||" ),
			Expression( "false" ),
			Code( "&&" ),
			Expression( "true" ),
			Code( "||" ),
			Expression( "false" )
		);
	} );
	
	it( "instruments both sides of conditional statement", () => {
		verify( Instrumentation(), Code( "true?" ), Expression( "false" ), Code( ":" ), Expression( "true" ) );
	} );
	
	it( "instruments nested conditional statement", () => {
		verify(
			Instrumentation(),
			Code( "true?" ),
			Code( "false?" ),
			Expression( "false" ),
			Code( ":" ),
			Expression( "true" ),
			Code( ":" ),
			Expression( "false" )
		);
	} );
	
	it( "instruments logical statement nested in condition of conditional statement", () => {
		verify(
			Instrumentation(),
			Expression( "false" ),
			Code( "&&" ),
			Expression( "true" ),
			Code( "?" ),
			Expression( "true" ),
			Code( ":" ),
			Expression( "false" )
		);
	} );
	
	it( "instruments logical statement nested in consequent side of conditional statement", () => {
		verify(
			Instrumentation(),
			Code( "true?" ),
			Expression( "false" ),
			Code( "&&" ),
			Expression( "true" ),
			Code( ":" ),
			Expression( "false" )
		);
	} );
	
	it( "instruments logical statement nested in alternate side of conditional statement", () => {
		verify(
			Instrumentation(),
			Expression( "false" ),
			Code( "&&" ),
			Code( "(true?" ),
			Expression( "true" ),
			Code( ":" ),
			Expression( "false" ),
			Code( ")" )
		);
	} );
	
	it( "supports statements before super() in constructor", () => {
		verify(
			Code( "class A{}class B extends A{constructor(){" ),
			Statement( "let v=1;" ),
			Statement( "super();" ),
			Code( "}}" )
		);
	} );
	
	it( "supports expressions before super() in constructor", () => {
		verify(
			Code( "class A{}class B extends A{constructor(){" ),
			Statement( "let v=true?" ),
			Expression( "false" ),
			Code( ":" ),
			Expression( "true" ),
			Code( ";" ),
			Statement( "super();" ),
			Code( "}}" )
		);
	} );
	
	it( "considers only unique files", () => {
		const coverageData = [];
		instrumentCode( Buffer.from( "" ), "test.js", coverageData );
		instrumentCode( Buffer.from( "" ), "test2.js", coverageData );
		instrumentCode( Buffer.from( "" ), "test.js", coverageData );
		
		expect( coverageData.length ).toBe( 2 );
		expect( coverageData[ 0 ].name ).toBe( "test.js" );
		expect( coverageData[ 1 ].name ).toBe( "test2.js" );
	} );
} );

function Code( code ) {
	return {
		sourceCode: code,
		instrumentedCode: code
	};
}

function Instrumentation() {
	return {
		sourceCode: "",
		instrumentedCode: `__$cover(${fileIndex},${statementIndex++});`,
		isCoverable: true
	};
}

function Statement( statement ) {
	return {
		sourceCode: statement,
		instrumentedCode: `__$cover(${fileIndex},${statementIndex++});${statement}`,
		isCoverable: true
	};
}

function Expression( expression ) {
	return {
		sourceCode: expression,
		instrumentedCode: `(__$cover(${fileIndex},${statementIndex++})&&(${expression}))`,
		isCoverable: true
	};
}

function BlockFix() {
	return {
		sourceCode: ";",
		instrumentedCode: "{;}"
	};
}