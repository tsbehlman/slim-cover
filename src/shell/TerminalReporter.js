const { relative } = require( "path" );
const LineScanner = require( "../../lib/line-scanner" );
const RingBuffer = require( "../../lib/ring-buffer" );
const lineCoverageConverter = require( "./lineCoverageConverter" );

const Reset = "\x1b[0m";
const Invert = "\x1b[7m";
const FgRed = "\x1b[31m";
const FgYellow = "\x1b[33m";
const FgGreen = "\x1b[32m";

function padLeft( pad, str ) {
	return ( pad + str ).slice( -pad.length );
}

function numDigits( num ) {
	if( num === 0 ) {
		return 1;
	}
	else {
		return Math.trunc( Math.log10( num ) + 1 );
	}
}

class NumberedShell {
	constructor( coverageData, options ) {
		this.source = coverageData.source;
		this.lineCoverage = lineCoverageConverter( coverageData.statements );
		
		this.lineNumberDigits = this.getLineNumberDigits();
		this.lineNumberPadding = " ".repeat( this.lineNumberDigits );
		
		this.options = {
			numContextLines: 3,
			...options
		};
		
		this.output = "";
		this.lineBuffer = new RingBuffer( this.options.numContextLines );
		this.linesToPrint = 0;
		this.lastOutputtedLineNumber = NaN;
	}
	
	getLineNumberDigits() {
		return numDigits( this.lineCoverage.length - 1 );
	}
	
	getFormattedCoverageData() {
		let lineNumber = 1;
		let totalStatements = 0;
		let totalCoveredStatements = 0;
		
		for( const lineSource of new LineScanner( this.source ) ) {
			const line = {
				source: lineSource,
				number: lineNumber,
				coverage: this.lineCoverage[ lineNumber ]
			};
			
			this.outputOrBufferLine( line );
			
			lineNumber++;
			totalStatements += line.coverage.numStatements;
			totalCoveredStatements += line.coverage.numCoveredStatements;
		}
		
		return {
			formattedSource: this.output,
			totalStatements: totalStatements,
			totalCoveredStatements: totalCoveredStatements
		};
	}
	
	outputOrBufferLine( line ) {
		if( line.coverage.numCoveredStatements < line.coverage.numStatements ) {
			while( this.lineBuffer.length > 0 ) {
				this.outputLine( this.lineBuffer.removeFirst() );
			}
			
			this.linesToPrint = this.options.numContextLines;
			
			this.outputLine( line );
		}
		else if( this.linesToPrint > 0 ) {
			this.outputLine( line );
			this.linesToPrint--;
		}
		else {
			if( this.lineBuffer.length === this.options.numContextLines ) {
				this.lineBuffer.removeFirst();
			}
			this.lineBuffer.addLast( line );
		}
	}
	
	outputBreakLine() {
		this.output += this.formatGutter( "---" ) + "\n";
	}
	
	outputLine( line ) {
		if( line.number > this.lastOutputtedLineNumber + 1 ) {
			this.outputBreakLine();
		}
		
		this.output += this.formatLineNumber( line.number );
		
		this.output += " ";
		
		this.output += this.formatLineSource( line.source, line.coverage );
		
		this.output += "\n";
		
		this.lastOutputtedLineNumber = line.number;
	}
	
	formatGutter( gutterText ) {
		return `${ Invert } ${ padLeft( this.lineNumberPadding, gutterText ) } ${ Reset }`;
	}
	
	formatLineNumber( lineNumber ) {
		return this.formatGutter( String( lineNumber ) );
	}
	
	formatLineSource( lineSource, lineCoverage ) {
		let formattedLine = "";
		
		let lineIsColored = false;
		
		if( lineCoverage.numStatements > 0 ) {
			lineIsColored = true;
			if( lineCoverage.numCoveredStatements === lineCoverage.numStatements ) {
				formattedLine += FgGreen;
			}
			else if( lineCoverage.numCoveredStatements > 0 ) {
				formattedLine += FgYellow;
			}
			else if( lineCoverage.numCoveredStatements === 0 ) {
				formattedLine += FgRed;
			}
		}
		
		formattedLine += lineSource.replace( /^\t+/, ( tabs ) => {
			return "    ".repeat( tabs.length );
		} );
		
		if( lineIsColored ) {
			formattedLine += Reset;
		}
		
		return formattedLine;
	}
}

module.exports = function( coverageData, project, options, outputStream ) {
	let numStatements = 0;
	let numCoveredStatements = 0;
	
	for( const file of coverageData ) {
		const shell = new NumberedShell( file, options );
		const data = shell.getFormattedCoverageData();
		
		if( data.totalCoveredStatements < data.totalStatements ) {
			const fileName = relative( project, file.name );
			outputStream.write( `${ Invert } ${ fileName } ${ Reset }\n` );
			outputStream.write( data.formattedSource );
		}
		
		numStatements += data.totalStatements;
		numCoveredStatements += data.totalCoveredStatements;
	}
	
	if( numCoveredStatements < numStatements ) {
		const percentage = ( numCoveredStatements * 100 / numStatements ).toFixed( 1 );
		outputStream.write( "\nCovered " + numCoveredStatements.toLocaleString() +
			" of " + numStatements.toLocaleString() + " statements (" + percentage + "%)\n" );
	}
	else {
		outputStream.write( "\nCovered all " + numStatements.toLocaleString() + " statements (100%)\n" );
	}
};