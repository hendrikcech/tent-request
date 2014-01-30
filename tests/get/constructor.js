var test = require('tape')
var config = require('../config')
var get = require('../../lib/get').checkArgs

var id = 'abc123'
var entity = 'https://some.entity/'
var opts = { version: '321cba', profiles: 'all' }
var cb = new Function

test('get() throws', function(t) {
	t.throws(get)
	t.end()
})

var tests = {
	'id': [id, null, null, null],
	'id, entity': [id, entity, null, null],
	'id, opts': [id, null, opts, null],
	'id, cb': [id, null, null, cb],
	'id, entity, opts': [id, entity, opts, null],
	'id, opts, cb': [id, null, opts, cb],
	'id, entity, opts, cb': [id, entity, opts, cb] 
}

for(var key in tests) {
	test('get(' + key + ')', function(key, t) {
		t.deepEqual(eval('get(' + key + ')'), tests[key])
		t.end()
	}.bind(null, key))
}