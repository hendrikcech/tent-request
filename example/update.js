var request = require('..')
var config = require('../test/config.json')

var client = request(config.meta, config.auth)
var req = client.update(
	'HccNVvs__rwa4dXe5DxeEw',
	'sha512t256-0c005935fa828d858d8225f4b85bb553f7bae62',
	'https://tent.io/types/status/v0#',
	{ versionMessage: 'Update, update.' },
	{ text: 'New Text.' },
	cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(require('util').inspect(body, { depth: 10, colors: true }))
}