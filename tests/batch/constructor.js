var test = require('tape')
var config = require('../config')
var Batch = require('../../lib/batch')

var meta = config.meta
var auth = config.auth

test('batch has functions', function(t) {
	var batch = new Batch(meta, auth)

	var baseMethods = ['create', 'update', 'delete', 'get', 'query']
	baseMethods.forEach(function(method) {
		t.equal(typeof batch[method], 'function', method)
	})

	has(batch.get, 'versions')
	has(batch.get.versions, 'count')
	has(batch.get, 'childVersions')
	has(batch.get.childVersions, 'count')

	has(batch.query, 'count')

	has(batch, 'end')

	t.end()

	function has(fn, name) {
		t.equal(typeof fn[name], 'function', name)
	}
})

test('new Batch', function(t) {
	var batch = new Batch(meta, auth)

	batch.create('my.type')
	batch.delete('thisid')

	t.equal(batch._order, 2, 'requests added')

	var req = batch._requests[0]
	t.equal(typeof req.method, 'string', 'has method')
	t.equal(typeof req.headers, 'object', 'has headers object')
	t.ok(req.cb, 'has callback')

	t.end()
})

test('call end without adding requests', function(t) {
	var batch = new Batch(meta, auth)
	batch.end(function(err, res, body) {
		t.notOk(err, 'no error')
		t.ok(res && typeof res === 'object', 'mock res object')
		t.equal(res.statusCode, 0, 'statusCode')
		t.deepEqual(res.headers, {}, 'headers object')
		t.deepEqual(body, [], 'body is empty array')
		t.end()
	})
})