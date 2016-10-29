let getCoverage = require( "./index" );

const Reset = "\x1b[0m";
const FgRed = "\x1b[31m";
const BgRed = "\x1b[41m";
const FgGreen = "\x1b[32m";
const BgGreen = "\x1b[42m";

let stdout = process.stdout;

let files = getCoverage( "./test.js" );

for( let entry of files.entries() ) {
	stdout.write( entry[0] + "\n" );
	let source = entry[1].source;
	let lastIndex = 0;
	for( let statement of entry[1].statements ) {
		let output = source.substring( lastIndex, lastIndex = statement.start.index - statement.start.column - 1 );
		if( statement.isCovered ) {
			output += BgGreen;
		}
		else {
			output += BgRed;
		}
		output += source.substring( lastIndex, lastIndex = statement.end.index );
		output += Reset;
		stdout.write( output );
	}
	stdout.write( source.substring( lastIndex, source.length ) + "\n\n" );
}