var test = require('tape')

var request = require('..')
var config = require('./config.json')

test('client() constructor', function(t) {

	var metaPost = {
		post: {
			content: config.meta
		}
	};
	var clientMetaPost = request.createClient(metaPost);
	t.deepEqual(clientMetaPost.meta, config.meta, 'meta set')

	var meta = request.createClient(config.meta)
	t.deepEqual(meta.meta, config.meta, 'meta set')
	t.notOk(meta.auth, 'no auth set')

	var metaAuth = request.createClient(config.meta, config.auth)
	t.deepEqual(metaAuth.meta, config.meta, 'meta set')

	var convertedAuth = {
		id: config.auth.id || config.auth.access_token,
		key: config.auth.key || config.auth.hawk_key,
		algorithm: config.auth.algorithm || config.auth.hawk_algorithm
	}
	t.deepEqual(metaAuth.auth, convertedAuth,
		'auth set and converted')

	t.end()
})

test('client() functions', function(t) {
	var c = request.createClient(config.meta, config.auth)

	;['create', 'query', 'get', 'update', 'delete']
		.forEach(function(fn) {
			t.ok(c[fn], '.' + fn + ' exposed')
		})

	t.end()
})
