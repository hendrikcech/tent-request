var test = require('tape')
var request = require('../..')
var config = require('../config')
var stream = require('stream')

var type = config.type
var client = request(config.meta, config.auth)

var ids = []

test('string and buffer', function(t) {
	t.plan(4)
	var attachments = [{
		name: 'textOne.txt',
		type: 'text/plain',
		category: 'text[0]',
		data: 'Some Text\nAnd a bit more'
	}, {
		name: 'textTwo.txt',
		type: 'text/plain',
		category: 'text[1]',
		data: new Buffer('Another text')
	}]
	var req = client.create(type, { attachments: attachments }, cb)
	function cb(err, res, body) {
		t.notOk(err, 'no error')
		t.ok(res && typeof res === 'object', 'res object')
		t.ok(body && typeof body === 'object', 'body object')
		t.ok(Array.isArray(body.post.attachments)
			&& body.post.attachments.length === 2, 'attachments array')

		ids.push(body.post.id)
	}
})

test('stream', function(t) {
	t.plan(4)

	var attaStream = new stream.PassThrough()
	var attaData = 'random streaming attachment'
	attaStream.end(attaData)

	var attachment = [{
		name: 'some.data',
		type: 'application/random',
		category: 'data[0]',
		size: Buffer.byteLength(attaData),
		data: attaStream
	}]

	var req = client.create(type, { attachments: attachment }, cb)
	function cb(err, res, body) {
		t.notOk(err, 'no error')
		t.ok(res && typeof res === 'object', 'res object')
		t.ok(body && typeof body === 'object', 'body object')
		t.ok(Array.isArray(body.post.attachments)
			&& body.post.attachments.length === 1, 'attachments array')

		ids.push(body.post.id)
	}
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