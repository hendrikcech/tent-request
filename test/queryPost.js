var vows = require('vows')
var assert = require('assert')
var request = require('../request')
var meta = require('./meta.json')

function testSetter(arg, expected) {
	var context = {
		topic: function(client) {
			var split = this.context.name.split(/ +/) // ['published_at()', 'comment']
			var command = split[0] // 'published_at()'
			command = command.slice(0, -2)	// 'published_at'

			var query = client.queryPost()
			query[command](arg)
			return query.print()
		}
	}
	context['valid'] = function(query) {
		assert.deepEqual(query, expected)
	}

	return context
}

vows.describe('queryPost()').addBatch({
	'': {
		topic: function() {
			var client = request.createClient(meta)
			return client
		},
		'send()': {
			topic: function(client) {
				var query = client.queryPost()
					.send(this.callback)
			},
			'no error': function(err, res, body) {
				assert.isNull(err)
			},
			'valid response object': function(err, res, body) {
				assert.include(res, 'statusCode')
			},
			'valid body': function(err, res, body) {
				console.log(body)
				//assert.include(body, 'content')
			}
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