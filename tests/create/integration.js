var test = require('tape')
var request = require('../..')
var config = require('../config')

var client = request(config.meta, config.auth)

var ids = []

test('create(type, cb)', function(t) {
	t.plan(3)
	client.create(config.type, function(err, res, body) {
		t.error(err, 'no error')
		t.ok(res)
		t.equal(body.post.type, config.type)

		ids.push(body.post.id)
	})
})

test('create(type, metadata, content, cb)', function(t) {
	t.plan(8)

	var pA = Date.now()
	var license = 'http://some.license'

	client.create(config.type, {
		publishedAt: pA,
		licenses: license,
		permissions: false
	}, {
		text: 'random entry',
		weather: 'fine'
	}, function(err, res, body) {
		t.error(err)
		t.ok(res)
		t.equal(body.post.type, config.type)
		t.equal(body.post.published_at, pA)
		t.equal(body.post.licenses[0].url, license)
		t.equal(body.post.permissions.public, false)
		t.equal(body.post.content.text, 'random entry')
		t.equal(body.post.content.weather, 'fine')

		ids.push(body.post.id)
	})
})

test('create post with mentions', function(t) {
	t.plan(3)

	client.create(config.type, { mentions: ids[0] }, { text: 'notify yoyo' },
	function(err, res, body) {
		t.error(err)
		t.ok(res)
		t.deepEqual(body.post.mentions, [{ post: ids[0] }])

		ids.push(body.post.id)
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