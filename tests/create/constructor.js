var test = require('tape')
var config = require('../config')
var create = require('../../lib/create')

var meta = config.meta
var type = config.type
var metadata = { publishedAt: 123456789, licenses: 'http://some.license' }
var content = { text: 'Deep Thought', location: 'Here or there' }
var cb = new Function

test('create() throws', function(t) {
	t.throws(create)
	t.end()
})

test('return object has expected properties', function(t) {
	var req = create(meta, type)
	t.ok(typeof req.url === 'string', 'url')
	t.ok(typeof req.method === 'string', 'method')
	t.ok(typeof req.headers === 'object', 'headers')
	t.ok(typeof req.body === 'string', 'data')
	t.end()
})

test('url, content-type header', function(t) {
	var req = create(meta, type)

	t.equal(req.url, meta.servers[0].urls.new_post, 'url correct')
	
	var header = 'application/vnd.tent.post.v0+json; type="'+type+'"'
	t.equal(req.headers['Content-Type'], header, 'content-type header correct')
	
	t.end()
})

test('type, metadata', function(t) {
	var req = create(meta, type, metadata)
	var post = JSON.parse(req.body)
	t.equal(post.type, type, 'type set')
	t.equal(post.published_at, metadata.publishedAt, 'published_at set')
	t.ok(Object.keys(post.content).length === 0, 'content empty')
	t.end()
})

test('type, content', function(t) {
	var req = create(meta, type, content)
	var post = JSON.parse(req.body)
	t.equal(post.type, type, 'type set')
	t.deepEqual(post.content, content, 'content set')
	t.ok(!post.text, 'content properties not set on root')
	t.end()
})

test('type, metadata, content', function(t) {
	var req = create(meta, type, metadata, content)
	var post = JSON.parse(req.body)
	t.equal(post.type, type, 'type set')
	t.equal(post.published_at, metadata.publishedAt, 'published_at set')
	t.deepEqual(post.content, content, 'content set')
	t.ok(!post.text, 'content properties not set on root')
	t.end()
})