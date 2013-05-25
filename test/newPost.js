var vows = require('vows')
var assert = require('assert')
var request = require('../request')
var meta = require('./config.json').meta
var auth = require('./config.json').auth

function testSetter(arg, expected) {
	var context = {
		topic: function(client) {
			var split = this.context.name.split(/ +/) // ['published_at()', 'comment']
			var command = split[0] // 'published_at()'
			command = command.slice(0, -2)	// 'published_at'

			var post = client.newPost('http://post.type')
			post[command](arg)
			return post.print()
		}
	}
	context['valid'] = function(post) {
		expected.type = expected.type || 'http://post.type'
		assert.deepEqual(post, expected)
	}

	return context
}

function assertResponse(topicFn) {
	return  {
		topic: topicFn,
		'no error': function(err, res, body) {
			assert.isNull(err)
			assert.isUndefined(body.error)
			assert.equal(res.statusCode, 200)
		},
		'valid response object': function(err, res, body) {
			assert.include(res, 'statusCode')
		},
		'valid body': function(err, res, body) {
			assert.include(body, 'content')
		}
	}
}

vows.describe('newPost()').addBatch({
	'': {
		topic: function() {
			var client = request.createClient(meta)
			return client
		},
		'create()': {
			'without auth': assertResponse(function(client) {
				var app = {
					"name": "MAAAA Example App",
					"url": "https://app.blablabla.com",
					"redirect_uri": "https://app.blablabla.com/oauth"
				}
				var post = client.newPost('https://tent.io/types/app/v0#')
					.content(app)
					.permissions(false)
					.create(this.callback)
			}),
			'with auth': assertResponse(function() {
				var client = request.createClient(meta, auth)
				var post = client.newPost('https://tent.io/types/status/v0#')
					.content({ text: 'request test post' })
					.create(this.callback)
			})
		},
		'setters': {
			'published_at()': testSetter(123456789, { published_at: 123456789 }),
			'mention() single': testSetter('http://ment.ion', { mentions: ['http://ment.ion'] }),
			'mention() multiple': testSetter(['http://ment1.ion', 'ment2.ion'], { mentions: ['http://ment1.ion', 'ment2.ion'] }),
			'license() single': testSetter('http://licen.se', { licenses: [{ url: 'http://licen.se' }]}),
			'license() multiple': testSetter(['http://licen1.se', 'http://licen2.se'], { licenses: [{ url: 'http://licen1.se' }, { url: 'http://licen2.se'}]}),
			'type()': testSetter('https://ty.pe', { type: 'https://ty.pe' }),
			'content()': testSetter({ name: 'hi', 'who': { are: 'you?' }}, { content: { name: 'hi', 'who': { are: 'you?' }}}),
			'permissions() boolean': testSetter(false, { type: 'http://post.type', permissions: { public: false } }),
			'permissions() single entity': testSetter('https://enti.ty', { permissions: { public: false, entities: ['https://enti.ty'] }}),
			'permissions() single group': testSetter('groupID', { permissions: { public: false, groups: [{ post: 'groupID' }] }}),
			'permissions() multiple mixed': testSetter(['https://enti.ty', 'groupID', 'http://enti.ty'], {permissions: { public: false, entities: [ 'https://enti.ty', 'http://enti.ty' ], groups: [{ post: 'groupID' }] }})
		}
	}
}).export(module)