var test = require('tape')
var request = require('../..')
var config = require('../config')

var client = request(config.meta, config.auth)

var startTime = Date.now()
var post = {}

test('setup', function(t) {
	t.plan(1)
	client.create(config.type, function(err, res, body) {
		t.error(err)
		post.id = body.post.id
		post.versionId = body.post.version.id
	})
})

test('update() post', function(t) {
	t.plan(4)

	var publishedAt = Date.now() - 1000

	client.update(post.id, post.versionId, config.type,
		{ versionPublishedAt: publishedAt, versionMessage: 'commit message'},
		{ text: 'its here!' }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.post.content.text, 'its here!', 'post updated')
		t.equal(body.post.version.published_at, publishedAt,
			'version published_at set')
		t.equal(body.post.version.message, 'commit message',
			'version message set')
	}
})

test('teardown', function(t) {
	t.plan(1)

	client.delete(post.id, { createDeletePost: false }, function(err) {
		if(err) t.fail(err)
		t.pass('post deleted')
	})
})