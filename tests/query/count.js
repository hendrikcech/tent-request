var test = require('tape')
var config = require('../config')
var request = require('../..')

var client = request(config.meta, config.auth)

test('query.count', function(t) {
	t.ok(client.query, 'client.query exists')
	t.ok(client.query.count, 'client.query.count exists')
	t.end()
})