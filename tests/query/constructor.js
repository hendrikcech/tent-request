var test = require('tape')
var config = require('../config')
var query = require('../../lib/query').checkArgs

var qObj = { limit: 5 }
var opts = { profiles: ['entity', 'refs'], maxRefs: 5 }
var cb = new Function

var tests = {
	'': [null, null, null],
	'qObj': [qObj, null, null],
	'qObj, opts': [qObj, opts, null],
	'qObj, cb': [qObj, null, cb],
	'opts': [null, opts, null],
	'opts, cb': [null, opts, cb],
	'cb': [null, null, cb],
	'qObj, opts, cb': [qObj, opts, cb] 
}

for(var key in tests) {
	test('query(' + key + ')', function(key, t) {
		t.deepEqual(eval('query(' + key + ')'), tests[key])
		t.end()
	}.bind(null, key))
}