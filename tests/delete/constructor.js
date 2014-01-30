var test = require('tape')
var config = require('../config')
var del = require('../../lib/delete').checkArgs

var id = 'abc321'
var opts = { version: 'rndVer' }
var cb = new Function

test('del() throws', function(t) {
	t.throws(del)
	t.end()
})

var tests = {
	'id': [id, null, null],
	'id, opts': [id, opts, null],
	'id, cb': [id, null, cb],
	'id, opts, cb': [id, opts, cb]
}

for(var key in tests) {
	test('del(' + key + ')', function(key, t) {
		t.deepEqual(eval('del(' + key + ')'), tests[key])
		t.end()
	}.bind(null, key))
}