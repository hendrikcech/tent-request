var test = require('tape')
var config = require('../config')
var update = require('../../lib/update').checkArgs

var id = 'eyedee'
var parentStr = 'abczyx'
var parentObj = { version: 'defstr', entity: 'https://enti.ty', post: 'postId'}
var type = config.type
var metadata = { publishedAt: 123456789, permissions: false }
var content = { some: 'custom', key: true }
var cb = new Function

test('at least id, parent and type required; throws otherwise', function(t) {
	t.throws(update)
	t.throws(update.bind(update, id))
	t.throws(update.bind(update, id, parentStr))
	t.throws(update.bind(update, id, { random: 'key' }, type))
	t.end()
})

var tests = {
	'id, parentStr, type': [id, parentStr, type, null, null, null],
	'id, parentObj, type': [id, parentObj, type, null, null, null],
	'id, parentObj, type, metadata': [id, parentObj, type, metadata, null, null],
	'id, parentObj, type, content': [id, parentObj, type, null, content, null],
	'id, parentObj, type, cb': [id, parentObj, type, null, null, cb],
	'id, parentObj, type, metadata, cb':
		[id, parentObj, type, metadata, null, cb],
	'id, parentObj, type, content, cb':
		[id, parentObj, type, null, content, cb],
	'id, parentObj, type, metadata, content, cb':
		[id, parentObj, type, metadata, content, cb]
}

for(var key in tests) {
	test('update(' + key + ')', function(key, t) {
		t.deepEqual(eval('update(' + key + ')'), tests[key])
		t.end()
	}.bind(null, key))
}