var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta, auth)

list.forEach(function(name) {
	client.new('https://tent.io/types/status/v0#', cb)
	.content({
		"text": blabla
	})
	.permissions(false)
})
//post.pipe(process.stdout)

function cb(err, res, body) {
	if(err) console.error(err)
	console.log(res.statusCode)
	console.log(body)
}