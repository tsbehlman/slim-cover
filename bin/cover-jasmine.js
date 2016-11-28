#!/usr/bin/env node

if( process.argv.length < 3 ) {
	console.log( "Specify a project with tests to execute." );
	return;
}

const path = require( "path" );
const Jasmine = require( "jasmine" );
const getCoverage = require( "../core" );
const printCoverage = require( "../shell" );

let baseDir = path.resolve( process.argv[2] );
let specDir = baseDir + "/spec";
let configFile = specDir + "/support/jasmine.json";

let jasmine = new Jasmine( {
	projectBaseDir: baseDir
} );

jasmine.loadConfigFile( configFile );

Jasmine.prototype.loadSpecs = function() {
	for( let specFile of this.specFiles ) {
		getCoverage( specFile );
	}
};

jasmine.onComplete( function( passed ) {
	if( passed ) {
		printCoverage( __$coverage, process.stdout );
	}
} );

jasmine.execute();