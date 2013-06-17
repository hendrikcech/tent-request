var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta, auth)

client.create('https://tent.io/types/status/v0#', cb)
.content({
	text: 'Täääst'
})
.permissions(false)

//post.pipe(process.stdout)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}