var request = require('../request')
var config = require('../test/config.json')

var client = request.createClient(config.meta, config.auth)

var post = client.create('https://tent.io/types/status/v0#', cb)
	.content('text', 'Status Post')

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}
//post.pipe(process.stdout)