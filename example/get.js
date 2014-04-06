var request = require('..')
var config = require('../tests/config')

var id = process.argv[2]
if(!id) {
	console.error('usage: node get.js postid')
	process.exit(1)
}

var client = request(config.meta, config.auth)
var post = client.get(id, cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(require('util').inspect(body, { depth: 10, colors: true }))
}