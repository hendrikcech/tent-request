var test = require('tape')
var request = require('../..')
var config = require('../config')

var client = request(config.meta, config.auth)

var startTime 
var ids = []

test('setup', function(t) {
	startTime = Date.now()

	var num = 3
	t.plan(num)
	for(var i = 0; i < num; i++) {
		client.create(config.type, function(err, res, body) {
			if(err) t.fail(err)
			else t.pass('dummy post created')
			ids.push(body.post.id)
		})
	}
})

test('query() .limit', function(t) {
	t.plan(2)
	client.query({ limit: 2 }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.posts.length, 2, 'limit works')
	}
})

test('query() .since', function(t) {
	t.plan(2)
	client.query({ since: startTime }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.posts.length, ids.length)
	}
})

test('query() .limit with profiles', function(t) {
	t.plan(2)
	client.query({ limit: 3 }, { profiles: 'all' }, cb)

	function cb(err, res, body) {
		t.error(err)
		t.ok(body.profiles)
	}
})

test('teardown', function(t) {
	t.plan(ids.length)
	ids.forEach(function(id) {
		client.delete(id, { createDeletePost: false }, function(err) {
			if(err) t.fail(err)
			else t.pass('dummy post deleted')
		})
	})
})