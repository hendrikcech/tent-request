var test = require('tape')
var config = require('../config')
var request = require('../..')

var client = request(config.meta, config.auth)

test('get.versions, .versions.count, .childVersions, .childVersions.count are existent',
function(t) {
	t.ok(client.get.versions)
	t.ok(client.get.versions.count)
	t.ok(client.get.childVersions)
	t.ok(client.get.childVersions.count)
	t.end()
})