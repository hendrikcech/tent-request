var request = require('..')
var config = require('../tests/config')

var client = request(config.meta, config.auth)

var batch = client.batch()
batch.get(.., cb)
batch.query.count(...)
batch.end(function(err, res, body) {
	// body array in same order as requests were added?
})