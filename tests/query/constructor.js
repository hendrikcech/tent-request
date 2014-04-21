var test = require('tape')
var config = require('../config')
var query = require('../../lib/query')

var meta = config.meta
var queryObj = { limit: 5 }
var opts = { profiles: ['entity', 'refs'], maxRefs: 5 }

test('no arguments', function(t) {
	var req = query(meta, [])
	t.equal(req.url, meta.servers[0].urls.posts_feed, 'correct url picked')
	t.equal(req.method, 'GET', 'right method')
	t.equal(req.headers['Accept'], 'application/vnd.tent.posts-feed.v0+json',
		'accept header set')
	t.end()
})

test('mode count', function(t) {
	var req = query(meta, ['count'])
	t.equal(req.method, 'HEAD', 'method now HEAD')
	t.end()
})

test('query', function(t) {
	var req = query(meta, [], queryObj)
	t.ok(req.url.indexOf('limit=5') > -1, 'limit query parameter set')
	t.end()
})

test('options: profiles and maxRefs', function(t) {
	var req = query(meta, [], opts)
	t.ok(req.url.indexOf('profiles=') > -1, 'profiles set')
	t.ok(req.url.indexOf('max_refs=5') > -1, 'max_refs set')
	t.end()
})

test('query, options', function(t) {
	var req = query(meta, [], queryObj, opts)
	t.ok(req.url.indexOf('limit=5') > -1, 'limit query parameter set')
	t.ok(req.url.indexOf('profiles=') > -1, 'profiles set')
	t.ok(req.url.indexOf('max_refs=5') > -1, 'max_refs set')
	t.end()
})