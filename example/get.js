var request = require('../request')
var config = require('../test/config.json')

var client = request.createClient(config.meta, config.auth)
var post = client.get.mentions.count('AB8mjnxlIeJ8n2tP5ztp-w', cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(require('util').inspect(body, { depth: 10, colors: true }))
}
//post.pipe(process.stdout)