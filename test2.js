let Document = require( "../MockDocument/Document" );

let document = new Document();
let testElement = document.createElement( "button" );
let testTextNode = document.createTextNode( "test" );
testElement.appendChild( testTextNode );

testElement.outerHTML;