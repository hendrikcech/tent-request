var vows = require('vows')
var assert = require('assert')
var request = require('../request')
var meta = require('./config.json').meta
var entity = require('./config.json').entity
var rndPost = require('./config.json').rndPost

vows.describe('getPost()').addBatch({
	'': {
		topic: function() {
			var client = request.createClient(meta)
			return client
		},
		'send()': {
			'vanilla': assertResponse(
				function(client) {
					client.getPost(entity, rndPost, this.callback)
				}, ['valid body', function(err, res, body) {
					assert.include(body, 'content')
				}]
			),
			'count': assertResponse(
				function(client) {
					client.getPost(entity, rndPost, this.callback).mentions().count()
				}, ['count in body', function(err, res, count) {
					assert.isNumber(count)
				}]
			)
		},
		'setters': { // [acceptHeader, method, version]
			'mentions()':
				testSetter(null, ['application/vnd.tent.post-mentions.v0+json', 'GET', false]),
			'versions()':
				testSetter(null, ['application/vnd.tent.post-versions.v0+json', 'GET', false]),
			'childVersions() without version':
				testSetter(null, ['application/vnd.tent.post-children.v0+json', 'GET', false]),
			'childVersions() with version':
				testSetter('asdffdas', ['application/vnd.tent.post-children.v0+json', 'GET', 'asdffdas']),
			'count()':
				testSetter(null, ['application/vnd.tent.post.v0+json', 'HEAD', false])
		}
	}
}).export(module)

function testSetter(arg, expected) {
	var context = {
		topic: function(client) {
			var split = this.context.name.split(/ +/) // ['published_at()', 'comment']
			var command = split[0] // 'published_at()'
			command = command.slice(0, -2)	// 'published_at'

			var post = client.getPost('http://enti.ty', 'postID')

			post[command](arg)
			return post.print()
		}
	}
	context['valid'] = function(post) {
		assert.deepEqual(post, expected)
	}

	return context
}

function assertResponse(topicFn) {
	var context = {
		topic: topicFn,
		'no error': function(err, res, body) {
			assert.isNull(err)
			assert.isUndefined(body.error)
			assert.equal(res.statusCode, 200)
		}
	}
	if(arguments.length === 1) return context

	for(var i = 1; i<arguments.length; i++) {
		context[arguments[i][0]] = arguments[i][1]
	}
	return context
}