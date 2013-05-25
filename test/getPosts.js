var vows = require('vows')
var assert = require('assert')
var request = require('../request')
var meta = require('./config.json').meta

function testSetter(arg, expected) {
	var context = {
		topic: function(client) {
			var split = this.context.name.split(/ +/) // ['published_at()', 'comment']
			var command = split[0] // 'published_at()'
			command = command.slice(0, -2)	// 'published_at'

			var query = client.getPosts()
			query[command](arg)
			return query.print()
		}
	}
	context['valid'] = function(query) {
		assert.deepEqual(query, expected)
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
		},
		'valid response object': function(err, res, body) {
			assert.include(res, 'statusCode')
		},
		'valid body': function(err, res, body) {
			assert.include(body, 'pages')
			assert.include(body, 'data')
		}
	}
	if(arguments.length === 1) return context

	for(var i = 1; i<arguments.length; i++) {
		context[arguments[i][0]] = arguments[i][1]
	}
	return context
}

vows.describe('getPosts()').addBatch({
	'': {
		topic: function() {
			var client = request.createClient(meta)
			return client
		},
		'send()': {
			'vanilla': assertResponse(function(client) {
				client.getPosts().send(this.callback)
			}),
			'with limit': assertResponse(
				function(client) {
					client.getPosts().limit(2).send(this.callback)
				}, ['exactly two responses', function(err, res, body) {
					assert.equal(body.data.length, 2)
				}]
			)
		},
		'setters': {
			'limit()': testSetter(25, { limit: 25 }),
			'sort_by()': testSetter('version.published_at', { sort_by: 'version.published_at' }),
			'since()': testSetter(123456789, { since:  123456789 }),
			'until()': testSetter(123456789, { until:  123456789 }),
			'before()': testSetter(123456789, { before: 123456789 }),
			'types() single': testSetter('http://ty.pe', { types: 'http://ty.pe' }),
			'types() multiple': testSetter(['http://ty.pe', 'https://ty.pe'], { types: 'http://ty.pe,https://ty.pe' }),
			'entities() single': testSetter('http://enti.ty', { entities: 'http://enti.ty' }),
			'entities() multiple': testSetter(['http://enti.ty', 'https://enti.ty'], { entities: 'http://enti.ty,https://enti.ty' }),
			//'mentions()': testSetter('version.published_at', {}),
		}
	}
}).export(module)