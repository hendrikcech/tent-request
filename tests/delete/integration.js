var test = require('tape')
var request = require('../..')
var config = require('../config')

var client = request(config.meta, config.auth)

var postOne = {}
var postTwo = {}

test('setup #1', function(t) {
	t.plan(2)
	client.create(config.type, function(err, res, body) {
		if(err) t.fail(err)
		else {
			postOne.id = body.post.id
			postOne.versions = [body.post.version.id]
			t.pass('created post #1')
		}
	})

	client.create(config.type, function(err, res, body) {
		if(err) t.fail(err)
		else {
			postTwo.id = body.post.id
			t.pass('created post #2')
		}
	})
})
test('setup #2', function(t) {
	t.plan(1)

	client.update(postOne.id, postOne.versions[0], config.type, cb)
	function cb(err, res, body) {
		if(err) t.fail(err)
		else {
			postOne.versions.push(body.post.version.id)
			t.pass('updated post')
		}
	}
})

test('delete() specific version', function(t) {
	t.plan(3)
	client.delete(postOne.id, { version: postOne.versions[0] }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.post.type, 'https://tent.io/types/delete/v0#','deleted')
		postExists(postOne.id, function(exists) {
			if(exists) t.pass('only one version deleted')
			else t.fail('entire post deleted')
		})
	}
})

test('delete() entire post', function(t) {
	t.plan(3)
	client.delete(postOne.id, function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.post.type, 'https://tent.io/types/delete/v0#','deleted')
		postExists(postOne.id, function(exists) {
			if(!exists) t.pass('entire post deleted')
			else t.fail('only one version deleted')
		})
	})
})

function postExists(id, cb) {
	client.get(id, function(err, res, body) {
		if(res.statusCode !== 200) cb(false)
		else cb(true)
	})
}

test('delete.createDeletePost(false)', function(t) {
	t.plan(2)
	client.delete(postTwo.id, { createDeletePost: false }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.notOk(body, 'no post created')
	}
})