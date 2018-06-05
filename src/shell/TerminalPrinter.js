const LineScanner = require( "../../lib/line-scanner" );
const RingBuffer = require( "../../lib/ring-buffer" );

const Reset = "\x1b[0m";
const Invert = "\x1b[7m";
const FgRed = "\x1b[31m";
const FgYellow = "\x1b[33m";
const FgGreen = "\x1b[32m";

function padLeft( pad, str ) {
	return ( pad + str ).slice( -pad.length );
}

function numDigits( num ) {
	return Math.log10( num + 1 ) + 1 >>> 0;
}

const PRINT_NEAREST_LINES = 3;

class NumberedShell {
	constructor( coverageData ) {
		this.source = coverageData.source;
		this.statements = coverageData.statements;
		this.statementIndex = 0;
		
		this.lineNumberDigits = this.getLineNumberDigits();
		this.lineNumberPadding = " ".repeat( this.lineNumberDigits );
		
		this.output = "";
		this.lineBuffer = new RingBuffer( PRINT_NEAREST_LINES );
		this.linesToPrint = 0;
		this.additionalLinesUncovered = 0;
	}
	
	getLineNumberDigits() {
		return numDigits( this.statements[ this.statements.length - 1 ].end.line );
	}
	
	getFormattedCoverageData() {
		let lineNumber = 1;
		let totalStatements = 0;
		let totalCoveredStatements = 0;
		
		for( let lineSource of new LineScanner( this.source ) ) {
			let line = {
				source: lineSource,
				number: lineNumber,
				coverage: this.getLineCoverage( lineNumber )
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
		if( this.shouldOutputLine( line.coverage ) ) {
			while( this.lineBuffer.length > 0 ) {
				this.outputLine( this.lineBuffer.removeFirst() );
			}
			
			this.linesToPrint = PRINT_NEAREST_LINES;
			
			this.outputLine( line );
		}
		else if( this.linesToPrint > 0 ) {
			this.outputLine( line );
			this.linesToPrint--;
		}
		else {
			if( this.lineBuffer.length === PRINT_NEAREST_LINES ) {
				this.lineBuffer.removeFirst();
			}
			this.lineBuffer.addLast( line );
		}
	}
	
	outputLine( line ) {
		this.output += this.formatLineNumber( line.number );
		
		this.output += " ";
		
		this.output += this.formatLine( line.source, line.coverage );
		
		this.output += "\n";
	}
	
	shouldOutputLine( lineCoverage ) {
		if( this.additionalLinesUncovered > 0 || lineCoverage.numCoveredStatements < lineCoverage.numStatements ) {
			return true;
		}
	}
	
	formatLineNumber( lineNumber ) {
		let numberString = padLeft( this.lineNumberPadding, lineNumber.toString() );
		return Invert + " " + numberString + " " + Reset;
	}
	
	formatLine( line, lineCoverage ) {
		let formattedLine = "";
		
		let lineIsColored = false;
		
		if( this.additionalLinesUncovered > 0 ) {
			lineIsColored = true;
			formattedLine += FgRed;
			this.additionalLinesUncovered--;
		}
		else if( lineCoverage.numStatements > 0 ) {
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
		
		formattedLine += line.replace( /^\t+/, ( tabs ) => {
			return "    ".repeat( tabs.length );
		} );
		
		if( lineIsColored ) {
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
			else if( statement.end.line !== lineNumber ) {
				this.additionalLinesUncovered += statement.end.line - statement.start.line + 1;
			}
		}
		
		return {
			numCoveredStatements: numCoveredStatements,
			numStatements: numStatements
		};
	}
}

module.exports = function( files, outputStream ) {
	let numStatements = 0;
	let numCoveredStatements = 0;
	
	for( let file of files ) {
		let shell = new NumberedShell( file, outputStream );
		let data = shell.getFormattedCoverageData();
		
		//if( data.totalCoveredStatements < data.totalStatements ) {
			outputStream.write( file.name + "\n" );
			outputStream.write( data.formattedSource );
		//}
		
		numStatements += data.totalStatements;
		numCoveredStatements += data.totalCoveredStatements;
	}
	
	if( numCoveredStatements < numStatements ) {
		let percentage = ( numCoveredStatements * 100 / numStatements ).toFixed( 1 );
		outputStream.write( "\nCovered " + numCoveredStatements.toLocaleString() +
			" of " + numStatements.toLocaleString() + " statements (" + percentage + "%)\n" );
	}
	else {
		outputStream.write( "\nCovered all " + numStatements.toLocaleString() + " statements (100%)\n" );
	}
};