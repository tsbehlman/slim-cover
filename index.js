const getCoverage = require( "./core" );
const printCoverage = require( "./shell" );

getCoverage( "./test.js" );
getCoverage( "./test2.js" );

printCoverage( __$coverage, process.stdout );