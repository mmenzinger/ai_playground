import prolog from './pl-core-fix.js';
import lists from 'tau-prolog/modules/lists';
import js from 'tau-prolog/modules/js';
import random from 'tau-prolog/modules/random';
import statistics from 'tau-prolog/modules/statistics';

import { fixPath, getFileContent } from '@scenario/util';

export const pl = prolog;

lists(pl);
js(pl);
random(pl);
statistics(pl);

// fix consult to handle local user generated files
pl.type.Session.prototype.consult = async function( path, options ) {
	let program = path;
	if( path.slice(path.length-3) === '.pl'){
		path = fixPath(path);
		program = await getFileContent(path);
	}
	const parsed = this.thread.consult(program, options);
	if(parsed !== true)
		throw Error(parsed);
	return parsed;
};

pl.type.Session.prototype.query = function( string ) {
	const success = this.thread.query( string );
	if(success !== true)
		throw Error(success);
	return success;
};

pl.type.Session.prototype.answer = function() {
	return new Promise((resolve, reject) => {
		this.thread.answer( resolve );
	});
};

pl.type.Session.prototype.answers = function( max = 1000, after = undefined ) {
	const results = [];
	let unfinished = false;
	return new Promise((resolve, reject) => {
		function add(result){
			if(result === false){
				if(unfinished){
					results.push(null);
				}
				resolve(results);
			}
			else if(result === null){
				unfinished = true;
			}
			else if(result.id === 'throw'){
				throw Error(result);
			}
			else{
				results.push(result);
			}
		}
		this.thread.answers( add, max, after );
	})
};

pl.type.Session.prototype.isTrue = function( string, runUntilResult = false ) {
	return new Promise((resolve, reject) => {
		const thread = this.thread;

		function result(value){
			if(value !== false){
				if(value === null){
					if(runUntilResult)
						thread.answer( result );
					else
						throw Error('No solution found!');
				}
					
				if(value.id === 'throw')
					throw Error(value);
				resolve(true);
			}
			resolve(false);
		}

		thread.query( string );
		thread.answer( result );
	});
};

pl.type.Session.prototype.run = function( string ) {
	return new Promise((resolve, reject) => {
		const success = this.thread.query( `${string}` );
		if(success !== true)
			throw Error(success);
		this.thread.answer( resolve );
	});
};

pl.type.Session.prototype.asserta = function( string ) {
	return new Promise((resolve, reject) => {
		const success = this.thread.query( `asserta(${string}).` );
		if(success !== true)
			throw Error(success);
		this.thread.answer( resolve );
	});
};

pl.type.Session.prototype.assertz = function( string ) {
	return new Promise((resolve, reject) => {
		const success = this.thread.query( `assertz(${string}).` );
		if(success !== true)
			throw Error(success);
		this.thread.answer( resolve );
	});
};

