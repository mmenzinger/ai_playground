self.pl = require('./pl-core-fix.js');
//import pl from 'tau-prolog/modules/core'//'./pl-core-fix.js';
//self.pl = pl;
require('tau-prolog/modules/lists')(pl);
require('tau-prolog/modules/js')(pl);
require('tau-prolog/modules/random')(pl);
require('tau-prolog/modules/statistics')(pl);

// fix consult to handle local user generated files
pl.type.Session.prototype.consult = async function( path, options ) {
	let program = path;
	if( path.slice(path.length-3) === '.pl'){
		path = fixPath(path);
		program = await getFileContent(path);
	}
	return this.thread.consult(program, options);
};
