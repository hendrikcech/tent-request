var test = require('tape')
var config = require('../config')
var create = require('../../lib/create').checkArgs

var type = config.type
var metadata = { publishedAt: 123456789, licenses: 'http://some.license' }
var content = { text: 'Deep Thought', location: 'Here or there' }
var cb = new Function

test('create() throws', function(t) {
	t.throws(create)
	t.end()
})

var tests = {
	'type': [type, null, null, null],
	'type, cb': [type, null, null, cb],
	'type, metadata': [type, metadata, null, null],
	'type, metadata, cb': [type, metadata, null, cb],
	'type, content': [type, null, content, null],
	'type, content, cb': [type, null, content, cb],
	'type, metadata, content': [type, metadata, content, null],
	'type, metadata, content, cb': [type, metadata, content, cb]
}

for(var key in tests) {
	test('create(' + key + ')', function(key, t) {
		t.deepEqual(eval('create(' + key + ')'), tests[key])
		t.end()
	}.bind(null, key))
}