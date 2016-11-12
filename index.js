let getCoverage = require( "./core" );
let printCoverage = require( "./shell" );

printCoverage( getCoverage( "./test.js" ), process.stdout );