var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

test('create() constructur', function(t) {
	var noArgs = client.create().destroy()
	t.pass('no args required')

	var type = client.create('http://ty.pe').destroy()
	t.equal(type.base.post.type, 'http://ty.pe', 'only type required')

	var post = { type: 'https://ty.pe', content: { hi: 'you' }}
	var wholePost = client.create(post).destroy()
	t.equal(wholePost.base.post, post, 'wholePost as first arg')

	var cb = client.create(new Function).destroy()
	t.ok(cb.base.callback, 'cb as first arg')

	var twoArgs = client.create('https://ty.pe', new Function).destroy()
	t.equal(twoArgs.base.post.type, 'https://ty.pe', 'type set right')
	t.ok(twoArgs.base.callback, 'cb set right')

	t.end()
})

test('create.publishedAt', function(t) {
	var pubAt = client.create().publishedAt(123456789).destroy()
	t.equal(pubAt.base.post.published_at, 123456789, 'value set')

	pubAt.publishedAt(987654321)
	t.equal(pubAt.base.post.published_at, 987654321, 'value overwritten')

	t.end()
})