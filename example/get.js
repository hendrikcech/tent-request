var request = require('..')
var config = require('../tests/config')

var client = request(config.meta, config.auth)
var post = client.get('HccNVvs__rwa4dXe5DxeEw', cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(require('util').inspect(body, { depth: 10, colors: true }))
}