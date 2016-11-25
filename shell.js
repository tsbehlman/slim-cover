const LineScanner = require( "./lib/line-scanner" );
const RingBuffer = require( "../ring-buffer" );

const Reset = "\x1b[0m";
const Invert = "\x1b[7m";
const FgRed = "\x1b[31m";
const FgYellow = "\x1b[33m";
const FgGreen = "\x1b[32m";

const LineStyle = "\x1b[47;30m";

function padLeft( pad, str ) {
	return ( pad + str ).slice( -pad.length );
}

function numDigits( num ) {
	return Math.log10( num + 1 ) + 1 >>> 0;
}

const PRINT_NEAREST_LINES = 1;

class NumberedShell {
	constructor( fileName, coverageData, outputStream ) {
		this.source = coverageData.source;
		this.statements = coverageData.statements;
		this.statementIndex = 0;
		this.lineNumberDigits = this.getLineNumberDigits();
		this.outputStream = outputStream;
		this.outputStream.write( fileName + "\n" );
		this.lineBuffer = new RingBuffer( PRINT_NEAREST_LINES );
		this.linesToPrint = 0;
		
		this.statements.sort( ( a, b ) => a.start.index - b.start.index );
	}
	
	getLineNumberDigits() {
		return numDigits( this.statements[this.statements.length - 1].end.line );
	}
	
	printLines() {
		let lineNumber = 1;
		for( let lineSource of new LineScanner( this.source ) ) {
			let line = {
				source: lineSource,
				number: lineNumber,
				coverage: this.getLineCoverage( lineNumber )
			};
			
			this.printOrBufferOutput( line );
			
			lineNumber++;
		}
	}
	
	printOrBufferOutput( line ) {
		if( this.shouldPrintLine( line.coverage ) ) {
			while( this.lineBuffer.length > 0 ) {
				this.printLine( this.lineBuffer.removeFirst() );
			}
			
			this.linesToPrint = PRINT_NEAREST_LINES;
			
			this.printLine( line );
		}
		else if( this.linesToPrint > 0 ) {
			this.printLine( line );
			this.linesToPrint--;
		}
		else {
			if( this.lineBuffer.length === PRINT_NEAREST_LINES ) {
				this.lineBuffer.removeFirst();
			}
			this.lineBuffer.addLast( line );
		}
	}
	
	printLine( line ) {
		let output = "";
		
		output += this.formatLineNumber( line.number );
		
		output += " ";
		
		output += this.formatLine( line.source, line.coverage );
		
		output += "\n";
		
		this.outputStream.write( output );
	}
	
	shouldPrintLine( lineCoverage ) {
		if( lineCoverage.numCoveredStatements < lineCoverage.numStatements ) {
			return true;
		}
	}
	
	formatLineNumber( lineNumber ) {
		let numberString = padLeft( " ".repeat( this.lineNumberDigits ), lineNumber.toString() );
		return Invert + " " + numberString + " " + Reset;
	}
	
	formatLine( line, lineCoverage ) {
		let formattedLine = "";
		
		let lineHasStatements = lineCoverage.numStatements > 0;
		
		if( lineHasStatements ) {
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
		
		formattedLine += line.replace( /^\t+/g, ( tabs ) => {
			return "    ".repeat( tabs.length );
		} );
		
		if( lineHasStatements ) {
			formattedLine += Reset;
		}
		
		return formattedLine;
	}
	
	getLineCoverage( lineNumber ) {
		let numStatements = 0;
		let numCoveredStatements = 0;
		
		for( ; this.statementIndex < this.statements.length; this.statementIndex++ ) {
			let statement = this.statements[ this.statementIndex ];
			
			if( statement.start.line !== lineNumber ) {
				break;
			}
			
			numStatements++;
			
			if( statement.isCovered ) {
				numCoveredStatements++;
			}
		}
		
		return {
			numCoveredStatements: numCoveredStatements,
			numStatements: numStatements
		};
	}
}

module.exports = function( files, outputStream ) {
	for( let entry of files.entries() ) {
		let shell = new NumberedShell( entry[0], entry[1], outputStream );
		shell.printLines();
	}
};