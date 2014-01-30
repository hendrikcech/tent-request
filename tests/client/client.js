var test = require('tape')
var request = require('../..')
var config = require('../config')
var meta = require('./data').meta
var auth = require('./data').auth


test('request() throws', function(t) {
	t.throws(request)
	t.end()
})

test('request(meta) with meta: body', function(t) {
	var client = request(meta)
	t.equal(client.meta, meta.post.content)
	t.end()
})

test('request(meta) with meta: body.post', function(t) {
	var client = request(meta.post)
	t.equal(client.meta, meta.post.content)
	t.end()
})

test('request(meta) with meta: body.post.content', function(t) {
	var client = request(meta.post.content)
	t.equal(client.meta, meta.post.content)
	t.end()
})

test('meta without entity and servers throws', function(t) {
	t.throws(request.bind(request, {}))
	t.end()
})

test('request(meta) with multiple servers', function(t) {
	var m = meta.post.content
	m.servers.push(JSON.parse(JSON.stringify(m.servers[0])))
	m.servers.push(JSON.parse(JSON.stringify(m.servers[0])))
	m.servers[1].preference = -1
	m.servers[2].preference = 3

	var client = request(m)
	t.equal(client.meta.servers[0].preference, -1)
	t.equal(client.meta.servers[1].preference, 0)
	t.equal(client.meta.servers[2].preference, 3)
	t.end()
})

test('throws if auth is no object', function(t) {
	t.throws(request.bind(request, meta, []))
	t.end()
})

test('auth without id/access_token or key/hawk_key throws', function(t) {
	t.throws(request.bind(request, meta, {}))
	t.end()
})

test('request(meta, auth) with auth { id, key }', function(t) {
	var client = request(meta, auth.idkey)
	t.equal(client.auth.id, auth.idkey.id)
	t.equal(client.auth.key, auth.idkey.key)
	t.end()
})
test('request(meta, auth) with auth { access_token, hawk_key }', function(t) {
	var client = request(meta, auth.hawk)
	t.equal(client.auth.id, auth.hawk.access_token)
	t.equal(client.auth.key, auth.hawk.hawk_key)
	t.end()
})
test('client has create, query, get, update and delete methods', function(t) {
	var client = request(meta, auth.idkey)
	t.ok(client.create)
	t.ok(client.query)
	t.ok(client.get)
	t.ok(client.update)
	t.ok(client.delete)
	t.end()
})