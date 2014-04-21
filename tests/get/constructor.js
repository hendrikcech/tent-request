var test = require('tape')
var config = require('../config')
var get = require('../../lib/get')

var meta = config.meta
var id = 'abc123'
var entity = 'https://some.entity/'
var opts = { version: '321cba', profiles: 'all' }
var cb = new Function

test('get() throws', function(t) {
	t.throws(get)
	t.end()
})

test('id', function(t) {
	var req = get(meta, [], id)
	t.ok(req.url.indexOf(id) > -1, 'id set')
	t.ok(req.url.indexOf(encodeURIComponent(meta.entity)) > -1, 'meta entity set')
	t.equal(req.method, 'GET', 'method correct')
	t.equal(req.headers['Accept'], 'application/vnd.tent.post.v0+json',
		'default accept header')
	t.end()
})

test('custom entity', function(t) {
	var req = get(meta, [], id, entity)
	t.ok(req.url.indexOf(encodeURIComponent(entity)) > -1, 'custom entity set')
	t.end()
})

test('options', function(t) {
	var req = get(meta, [], id, opts)
	t.ok(req.url.indexOf('version='+opts.version) > -1, 'version query param')
	t.ok(req.url.indexOf('profiles=') > -1, 'profiles query param')
	t.end()
})

test('mode switchs accept header', function(t) {
	var req = get(meta, ['versions'], id)
	t.equal(req.headers['Accept'], 'application/vnd.tent.post-versions.v0+json')
	t.end()
})

test('mode count changes method', function(t) {
	var req = get(meta, ['mentions', 'count'], id)
	t.equal(req.method, 'HEAD')
	t.end()
})