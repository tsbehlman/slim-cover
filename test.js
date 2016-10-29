//let Document = require("../MockDocument/Document");
debugger;
//new Document().createElement("test");
let i = 0;

if( Math.random() > 0.5 ) {
	i = 3;
}
else {
	i = 4;
}

for( let v of [1,2,3] ) {
	i += v;
}

console.log(i);