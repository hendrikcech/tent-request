var test = require('tape')
var config = require('../config')
var request = require('../..')

var meta = config.meta
var auth = config.auth

var client = request(meta, auth)

var ids = []
test('batch create', function(t) {
	// cupcake does not support batch requests yet
	if(!meta.servers[0].urls.batch || meta.entity.indexOf('cupcake.is') > -1) {
		t.fail('batch integration tests skipped')
		return t.end()
	}

	var batch = client.batch()

	var newPosts = 3

	t.plan(newPosts * 4 + newPosts * 6 + 4)
	var ids = ['49738fc6fd5643398d54edccee3948ea', 'a17e922331724cceb7f9db919b957ca5', '6edd698f736e4c63a90482fb0929c171']
	for(var i = 0; i < newPosts; i++) {
		batch.get(ids[i], newSoloCB(i))
		// batch.create(config.type, { order: i }, newSoloCB(i))
	}

	function newSoloCB(order) {
		return function(err, res, body) {
			t.pass('solo cb')
			t.notOk(err, 'no error')
			t.ok(res && typeof res === 'object', 'res object')
			t.ok(body && typeof body === 'object', 'body object')
		}
	}

	var endCalled = false
	batch.end(function(err, res, body) {
		if(!endCalled) t.pass('end cb called')
		else t.fail('end cb called more than once')

		t.notOk(err, 'no error')
		t.ok(res && typeof res === 'object', 'res object')
		t.ok(body && Array.isArray, 'body is array')

		body.forEach(function(part) {
			t.ok(typeof part === 'object', 'part is an object')
			t.equal(part.err, null, 'part.err is null')
			t.ok(part.res && typeof part === 'object', 'part.res is an object')
			t.equal(part.res.statusCode, 200, 'part.res.statusCode')
			t.ok(typeof part.res.headers === 'object', 'part.res.headers')
			t.ok(typeof body === 'object', 'body object returned')
		})
	})
})

test('batch delete', function(t) {
	t.end()
})