var test = require('tape')
var config = require('../config')
var update = require('../../lib/update')

var meta = config.meta

var id = 'eyedee'
var parentStr = 'abczyx'
var parentObj = { version: 'defstr', entity: 'https://enti.ty', post: 'postId'}
var type = config.type
var metadata = { publishedAt: 123456789, permissions: false }
var content = { some: 'custom', key: true }
var cb = new Function

test('at least id, parent and type required; throws otherwise', function(t) {
	t.throws(update)
	t.throws(update.bind(update, meta, id))
	t.throws(update.bind(update, meta, id, parentStr))
	t.throws(update.bind(update, meta, id, { random: 'key' }, type))
	t.end()
})

test('url, content-type header', function(t) {
	var req = update(meta, id, parentStr, type)

	t.equal(typeof req.url, 'string', 'req.url is string')
	t.equal(typeof req.headers['Content-Type'], 'string',
		'content-type header is string')

	t.end()
})

test('id, parentObj, type', function(t) {
	var req = update(meta, id, parentObj, type)
	var post = JSON.parse(req.body)

	t.deepEqual(post.version.parents[0], parentObj, 'parent object set')
	t.end()
})

test('id, parentObj, type, metadata', function(t) {
	var req = update(meta, id, parentObj, type, metadata)
	var post = JSON.parse(req.body)
	t.equal(typeof post.published_at, 'number', 'metadata set')
	t.equal(Object.keys(post.content).length, 0, 'no content')
	t.end()
})

test('id, parentObj, type, content', function(t) {
	var req = update(meta, id, parentObj, type, content)
	var post = JSON.parse(req.body)
	t.deepEqual(post.content, content, 'content object set')
	t.notOk(post.some, 'content not leaked to root object')
	t.end()
})

test('id, parentObj, type, metadata, content', function(t) {
	var req = update(meta, id, parentObj, type, metadata, content)
	var post = JSON.parse(req.body)
	t.deepEqual(post.content, content, 'content object set')
	t.notOk(post.some, 'content not leaked to root object')
	t.equal(typeof post.published_at, 'number', 'metadata set')
	t.end()	
})