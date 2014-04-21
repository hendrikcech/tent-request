var test = require('tape')
var request = require('../..')
var config = require('../config')

var client = request(config.meta, config.auth)

var ids = []
var post = {}

test('setup #1', function(t) {
	t.plan(1)
	client.create(config.type, function(err, res, body) {
		if(err) t.fail(err)
		else {
			post.id = body.post.id
			post.versions = [body.post.version.id]
			t.pass('created post #1')
		}
	})
})
test('setup #2', function(t) {
	t.plan(1)

	client.update(post.id, post.versions[0], config.type, cb)
	function cb(err, res, body) {
		if(err) t.fail(err)
		else {
			post.versions.push(body.post.version.id)
			t.pass('updated post')
		}
	}
})

test('exists', function(t) {
	t.plan(1)
	postExists(post.id, function(exists) {
		if(exists) t.pass('exists')
		else t.fail('does not exist')
	})
})

test('delete() specific version', function(t) {
	t.plan(3)
	client.delete(post.id, { version: post.versions[0] }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.post.type, 'https://tent.io/types/delete/v0#','deleted')
		postExists(post.id, function(exists) {
			if(exists) t.pass('only one version deleted')
			else t.fail('entire post deleted')
		})

		ids.push(body.post.id)
	}
})

test('delete() entire post', function(t) {
	t.plan(3)
	client.delete(post.id, function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.post.type, 'https://tent.io/types/delete/v0#','deleted')
		postExists(post.id, function(exists) {
			if(!exists) t.pass('entire post deleted')
			else t.fail('only one version deleted')
		})

		ids.push(body.post.id)
	})
})

function postExists(id, cb) {
	client.get(id, function(err, res, body) {
		if(res.statusCode !== 200) cb(false)
		else cb(true)
	})
}

test('delete.createDeletePost(false)', function(t) {
	t.plan(2*2)

	ids.forEach(function(id) {
		client.delete(id, { createDeletePost: false }, cb)
	})

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.notOk(body, 'no delete post created')
	}
})