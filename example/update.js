var request = require('../request')
var config = require('../test/config.json')

var client = request.createClient(config.meta, config.auth)
var req = client.update('AB8mjnxlIeJ8n2tP5ztp-w', cb)
	.parents('sha512t256-0c005935fa828d858d8225f4b85bb553f7bae62')
	.type('https://tent.io/types/status/v0#')
	//.versionMessage('Update, update!')
	.content({ text: 'New Text!' })

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(require('util').inspect(body, { depth: 10, colors: true }))
}
//req.pipe(process.stdout)