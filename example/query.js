var request = require('..')
var config = require('../tests/config')

var client = request(config.meta, config.auth)
var posts = client.query({ limit: 2, since: 1390968708016 }, cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(require('util').inspect(body, { depth: 2, colors: true }))

	if(this.next) this.next(cb)
}