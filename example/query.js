var request = require('..')
var config = require('../tests/config')

var client = request(config.meta, config.auth)
var posts = client.query({ limit: 2 }, cb)
// client.query.count(function(err, res, body) { console.log(body)})

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	// console.log(require('util').inspect(body, { depth: 2, colors: true }))
	console.log(body.posts.length)

	if(this.next) this.next(cb)
}