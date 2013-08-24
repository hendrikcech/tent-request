var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

;[
	{ key: 'mentions',
		header: 'application/vnd.tent.post-mentions.v0+json' },
	{ key: 'versions',
		header: 'application/vnd.tent.post-versions.v0+json' },
	{ key: 'childVersions',
		header: 'application/vnd.tent.post-children.v0+json' }
].forEach(function(fn) {

	test('get.' + fn.key, function(t) {
		var get = client.get[fn.key]('id').destroy()
		t.equal(get.base.acceptHeader, fn.header,
			'set accept header for ' + fn.key)

		var version = client.get[fn.key]('id', { version: 'hash' }).destroy()
		t.equal(version.base.query.version, 'hash',
			'specify version for ' + fn.key)

		t.end()
	})

	test('get.' + fn.key + '.count', function(t) {
		var getCount = client.get[fn.key].count('id').destroy()
		t.equal(getCount.base.acceptHeader, fn.header,
			'set accept header for ' + fn.key + '.count')
		t.equal(getCount.base.method, 'HEAD',
			'set method for ' + fn.key + '.count')

		var version = client.get[fn.key].count('id', { version: 'hash' }).destroy()
		t.equal(version.base.query.version, 'hash',
			'specify version for ' + fn.key + '.count')

		t.end()
	})
})
