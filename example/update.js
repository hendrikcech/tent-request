var request = require('../request')
var config = require('../test/config.json')

var client = request.createClient(config.meta, config.auth)
var req = client.update('JumBJkaEJO6cXA90g8mumg')
	.type('https://tent.io/types/status/v0#')
	.versionMessage('Update, update!')
	.content({ text: 'New Text!' })
	.licenses('http://mylicen.se')

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(body.post.content)
	console.log(body.post.version)
}
//req.pipe(process.stdout)