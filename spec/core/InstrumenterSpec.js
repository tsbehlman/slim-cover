require.cache[ require.resolve( "../../src/core/Instrumenter" ) ] = undefined;
const instrumentCode = require( "../../src/core/Instrumenter" );

let fileIndex = 0;
let statementIndex = 0;
let coverageData = [];

describe( "Instrumenter", () => {
	beforeEach( () => {
		coverageData = [];
		fileIndex = 0;
		statementIndex = 0;
	} );
	
	it( "instruments a variable declaration", () => {
		verifyStatements( "test1", Statement( "var test1 = 1;" ) );
	} );
	
	it( "instruments two variable declarations", () => {
		verifyStatements( "[ test1, test2 ]",
			Statement( "var test1 = 1;" ),
			Statement( "var test2 = 2;" )
		);
	} );
	
	it( "instruments two variable declarations with UTF-8 characters in between", () => {
		verifyStatements( "[ test1, test2 ]",
			Statement( "var test1 = 1;" ),
			Code( "/* ﬁ∞• */" ),
			Statement( "var test2 = 2;" )
		);
	} );
	
	it( "instruments a variable declaration in each of two files", () => {
		verifyStatements( "test1", Statement( "var test1 = 1;" ) );
		verifyStatements( "test2", Statement( "var test2 = 2;" ) );
	} );
	
	it( "instruments an expression statement", () => {
		verifyExpression( Statement( "1;" ) );
	} );
	
	it( "instruments a debugger statement", () => {
		verify( Statement( "debugger;" ) );
	} );
	
	it( "instruments a throw statement", () => {
		verify( Statement( "throw '';" ) );
	} );
	
	it( "does not instrument a function declaration", () => {
		verify( Code( "function test1(){}" ) );
	} );
	
	it( "instruments a return statement", () => {
		verify(
			Code( "function test1(){" ),
			Statement( "return 1;" ),
			Code( "}" )
		);
	} );
	
	it( "instruments a switch case", () => {
		verify(
			Code( "switch('a'){case 'a':" ),
			Instrumentation(),
			Code( "}" )
		);
	} );
	
	it( "instruments a switch default", () => {
		verify(
			Code( "switch('a'){default:" ),
			Instrumentation(),
			Code( "}" )
		);
	} );
	
	it( "instruments a break statement in a default", () => {
		verify(
			Code( "switch('a'){default:" ),
			Instrumentation(),
			Statement( "break;" ),
			Code( "}" )
		);
	} );
	
	it( "instruments a break statement in a case", () => {
		verify(
			Code( "switch('a'){case 'a':" ),
			Instrumentation(),
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
		verify(
			Code( "while(false)" ),
			BlockFixStart(),
			Statement( "true" ),
			BlockFixEnd()
		);
	} );
	
	it( "adds missing braces to do-while", () => {
		verify(
			Code( "do " ),
			BlockFixStart(),
			Statement( "true;" ),
			BlockFixEnd(),
			Code( "while( false );" )
		);
	} );
	
	it( "adds missing braces to if", () => {
		verify(
			Code( "if(false)" ),
			BlockFixStart(),
			Statement( "true" ),
			BlockFixEnd()
		);
	} );
	
	it( "adds missing braces to else", () => {
		verify(
			Code( "if(false){}else " ),
			BlockFixStart(),
			Statement( "true" ),
			BlockFixEnd()
		);
	} );
	
	it( "adds missing braces to else if", () => {
		verify(
			Code( "if(false){}else if(true)" ),
			BlockFixStart(),
			Statement( "true" ),
			BlockFixEnd()
		);
	} );
	
	it( "adds missing braces to with", () => {
		verify(
			Statement( "var obj = { foo: 'bar' };" ),
			Code( "with(obj)" ),
			BlockFixStart(),
			Statement( "foo;" ),
			BlockFixEnd()
		);
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
		verifyExpression( Instrumentation(), Expression( "true" ), Code( "&&" ), Expression( "false" ) );
	} );
	
	it( "instruments nested logical statements", () => {
		verifyExpression(
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
		verifyExpression( Instrumentation(), Code( "true?" ), Expression( "false" ), Code( ":" ), Expression( "true" ) );
	} );
	
	it( "instruments nested conditional statement", () => {
		verifyExpression(
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
		verifyExpression(
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
		verifyExpression(
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
		verifyExpression(
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
	
	it( "instruments arrow function body", () => {
		verifyExpression(
			Instrumentation(),
			Code( "(() => " ),
			Expression( "true" ),
			Code( ")()" )
		);
	} );
	
	it( "does not instrument arrow function block body", () => {
		verifyExpression(
			Instrumentation(),
			Code( "(() => {" ),
			Statement( "true" ),
			Code( "})()" )
		);
	} );
	
	it( "allows import", () => {
		verify( Code( "import foo from 'bar';" ) );
	} );
	
	it( "allows export of function declaration", () => {
		verify( Code( "export function test() {};" ) );
	} );
	
	it( "allows export of variable declaration", () => {
		verify( Code( "export const foo = 'bar';" ) );
	} );
	
	it( "allows default export of variable declaration", () => {
		verify( Code( "export default foo = 'bar';" ) );
	} );
	
	it( "allows export of predefined variable", () => {
		verify(
			Statement( "const foo = 'bar';" ),
			Code( "export { foo };" )
		);
	} );
	
	it( "allows default export of predefined variable", () => {
		verify(
			Statement( "const foo = 'bar';" ),
			Code( "export default foo;" )
		);
	} );
	
	it( "considers only unique files", () => {
		const coverageData = [];
		instrumentCode( "", "test.js", coverageData );
		instrumentCode( "", "test2.js", coverageData );
		instrumentCode( "", "test.js", coverageData );
		
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

function BlockFixStart() {
	return {
		sourceCode: "",
		instrumentedCode: "{"
	};
}

function BlockFixEnd() {
	return {
		sourceCode: "",
		instrumentedCode: "}"
	};
}

function verify( ...statements ) {
	verifyProgram( compile( statements ) );
}

function verifyStatements( returnExpression, ...statements ) {
	const program = compile( statements );
	
	verifyProgram( program );
	
	const expectation = new Function( `
		${ program.sourceCode };
		return ${ returnExpression };
	` )();
	
	const reality = new Function( `
		const __$cover = ( a, b ) => true;
		${ program.instrumentedCode };
		return ${ returnExpression };
	` )();
	
	expect( expectation ).toEqual( reality );
}

function verifyExpression( ...statements ) {
	const program = compile( statements );
	
	verifyProgram( program );
	
	const expectation = new Function( `
		return ${ program.sourceCode };
	` )();
	
	const instrumentedExpression = extractExpressionFromInstrumentedCode( program.instrumentedCode );
	
	const reality = new Function( `
		const __$cover = ( a, b ) => true;
		return ${ instrumentedExpression };
	` )();
	
	expect( expectation ).toEqual( reality );
}

function extractExpressionFromInstrumentedCode( instrumentedCode ) {
	const matches = /^__\$cover\(\d+,\d+\);(.*)/.exec( instrumentedCode );
	
	if( matches === null ) {
		return instrumentedCode;
	}
	
	return matches[ 1 ];
}

function compile( statements ) {
	let sourceCode = "";
	let instrumentedCode = "";
	let numStatements = 0;
	
	for( const statement of statements ) {
		sourceCode += statement.sourceCode;
		instrumentedCode += statement.instrumentedCode;
		if( statement.isCoverable ) {
			numStatements++;
		}
	}
	
	return {
		sourceCode,
		instrumentedCode,
		numStatements
	};
}

function verifyProgram( { sourceCode, instrumentedCode, numStatements } ) {
	const actualInstrumentedCode = instrumentCode( sourceCode, `test${fileIndex}.js`, coverageData );
	
	expect( actualInstrumentedCode ).toBe( instrumentedCode );
	
	const file = coverageData[ fileIndex ];
	
	expect( file.name ).toBe( `test${fileIndex}.js` );
	expect( file.source ).toBe( sourceCode );
	expect( file.statements ).toEqual( jasmine.any( Array ) );
	expect( file.statements.length ).toBe( numStatements );
	
	let lastStatement = file.statements[ 0 ];
	for( const statement of file.statements.slice( 1 ) ) {
		expect( lastStatement.start.index ).not.toBeGreaterThan( statement.start.index );
		lastStatement = statement;
	}
	
	fileIndex++;
	statementIndex = 0;
}