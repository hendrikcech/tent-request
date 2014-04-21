var test = require('tape')
var config = require('../config')
var create = require('../../lib/create')
var fs = require('fs')
var stream = require('stream')

var meta = config.meta
var type = config.type
// var metadata = { publishedAt: 123456789, licenses: 'http://some.license' }
var contentType = 'multipart/form-data; boundary='
var content = { text: 'Deep Thought', location: 'Here or there' }
var cb = new Function

function replaceBoundary(req, expected) {
	var regEx = new RegExp('{boundary}', 'g')
	return expected.replace(regEx, req.body.boundary)
}

test('string attachment', function(t) {
	t.plan(5)

	var attachment = {
		name: 'text.txt',
		type: 'text/plain',
		category: 'text[0]',
		data: 'Some Text\nAnd a bit more' // or string or buffer
	}
	var req = create(meta, type, { attachments: attachment })

	t.equal(req.url, meta.servers[0].urls.new_post, 'correct url')
	t.equal(req.method, 'POST', 'POST method')
	var ctHeader = req.headers['Content-Type']
	t.ok(ctHeader.indexOf(contentType) === 0
		&& ctHeader.indexOf('undefined') === -1, 'content-type set')
	t.ok(req.body instanceof stream, 'body is stream')

	var data = ''
	req.body.on('data', function(d) {
		data += d
	}).on('end', function() {
		var expected = fs.readFileSync(__dirname + '/expectedString.txt')
		t.equal(data, replaceBoundary(req, expected.toString()))
	})
})

test('string and buffer attachment', function(t) {
	t.plan(5)

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

	var req = create(meta, type, { attachments: attachments })

	t.equal(req.url, meta.servers[0].urls.new_post, 'correct url')
	t.equal(req.method, 'POST', 'POST method')
	var ctHeader = req.headers['Content-Type']
	t.ok(ctHeader.indexOf(contentType) === 0
		&& ctHeader.indexOf('undefined') === -1, 'content-type set')
	t.ok(req.body instanceof stream, 'body is stream')

	var data = ''
	req.body.on('data', function(d) {
		data += d
	}).on('end', function() {
		var expected = fs.readFileSync(__dirname + '/expectedStringBuffer.txt')
		t.equal(data, replaceBoundary(req, expected.toString()))
	})
})

test('stream attachment', function(t) {
	t.plan(5)

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

	var req = create(meta, type, { attachments: attachment })

	t.equal(req.url, meta.servers[0].urls.new_post, 'correct url')
	t.equal(req.method, 'POST', 'POST method')
	var ctHeader = req.headers['Content-Type']
	t.ok(ctHeader.indexOf(contentType) === 0
		&& ctHeader.indexOf('undefined') === -1, 'content-type set')
	t.ok(req.body instanceof stream, 'body is stream')

	var data = ''
	req.body.on('data', function(d) {
		data += d
	}).on('end', function() {
		var expected = fs.readFileSync(__dirname + '/expectedStream.txt')
		t.equal(data, replaceBoundary(req, expected.toString()))
	})
})