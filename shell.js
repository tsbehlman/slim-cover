let LineScanner = require( "./lib/line-scanner" );

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

class NumberedShell {
	constructor( fileName, coverageData, outputStream ) {
		this.source = coverageData.source;
		this.statements = coverageData.statements;
		this.statementIndex = 0;
		this.lineNumberDigits = this.getLineNumberDigits();
		this.outputStream = outputStream;
		this.outputStream.write( fileName + "\n" );
	}
	
	getLineNumberDigits() {
		return numDigits( this.statements[this.statements.length - 1].end.line );
	}
	
	printLines() {
		let lineNumber = 1;
		for( let line of new LineScanner( this.source ) ) {
			let output = "";
		
			output += this.formatLineNumber( lineNumber );
			
			output += " ";
		
			output += this.formatLine( line, lineNumber );
		
			output += "\n";
		
			this.outputStream.write( output );
		
			lineNumber++;
		}
	}
	
	formatLineNumber( lineNumber ) {
		let numberString = padLeft( " ".repeat( this.lineNumberDigits ), lineNumber.toString() );
		return Invert + " " + numberString + " " + Reset;
	}
	
	formatLine( line, lineNumber ) {
		let formattedLine = "";
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
		
		if( numStatements > 0 ) {
			if( numCoveredStatements === numStatements ) {
				formattedLine += FgGreen;
			}
			else if( numCoveredStatements === 0 ) {
				formattedLine += FgRed;
			}
			else {
				formattedLine += FgYellow;
			}
		}
		
		formattedLine += line.replace( "\t", "    " );
		
		if( numStatements > 0 ) {
			formattedLine += Reset;
		}
		
		return formattedLine;
	}
}

module.exports = function( files, outputStream ) {
	for( let entry of files.entries() ) {
		let shell = new NumberedShell( entry[0], entry[1], outputStream );
		shell.printLines();
	}
};