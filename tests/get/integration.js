var test = require('tape')
var request = require('../..')
var config = require('../config')

var client = request(config.meta, config.auth)

var ids = []
var versionIds = []

test('setup #1', function(t) {
	t.plan(1)
	client.create(config.type, function(err, res, body) {
		t.error(err)
		versionIds.push(body.post.version.id)
		ids.push(body.post.id)
	})
})

test('setup #2', function(t) {
	t.plan(2)
	for(var i = 0; i < 2; i++) {
		client.update(ids[0], versionIds[0], config.type, { num:i },
		function cb(err, res, body) {
			t.error(err)
			versionIds.push(body.post.version.id)
		})
	}
})

test('get(id) base post', function(t) {
	t.plan(2)
	client.get(ids[0], function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.post.id, ids[0], 'post exists')
	})
})
test('get(id, opts) base post with profiles', function(t) {
	t.plan(3)
	client.get(ids[0], { profiles: 'all' }, function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.post.id, ids[0], 'post exists')
		t.ok(body.profiles, 'profiles included')
	})
})

test('get.versions()', function(t) {
	t.plan(2)
	client.get.versions(ids[0], function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.versions.length, 3, 'three versions')
		// for(var i = 0; i < 3; i++) {
		// 	t.equal(body.versions[i].id, versionIds[2-i], 'right version')
		// }
	})
})

test('get.versions.count()', function(t) {
	t.plan(2)
	client.get.versions.count(ids[0], function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body, 3, 'correct versions count')
	})
})

test('get.childVersions()', function(t) {
	t.plan(2)
	client.get.childVersions(ids[0], { version: versionIds[0] },
	function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.versions.length, 2, 'correct number of children')
		// for(var i = 0; i < 2; i++) {
		// 	t.equal(body.versions[i].id, versionIds[2-i], 'right child')
		// }
	})
})

test('get.childVersions.count()', function(t) {
	t.plan(2)
	client.get.childVersions.count(ids[0], { version: versionIds[0] },
	function(err, res, body) {
		t.error(err, 'no error')
		t.equal(body, 2, 'correct child versions count')
	})
})

test('teardown', function(t) {
	t.plan(ids.length)

	ids.forEach(function(id) {
		client.delete(id, { createDeletePost: false }, function(err) {
			if(err) t.fail(err)
			else t.pass('post deleted')
		})
	})
})