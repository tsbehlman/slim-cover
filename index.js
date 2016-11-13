let getCoverage = require( "./core" );
let printCoverage = require( "./shell" );

getCoverage( "./test.js" )

printCoverage( getCoverage( "./test2.js" ), process.stdout );