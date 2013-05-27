var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta, auth)
var post = client.getPost('http://bb216a47d970.alpha.attic.is', '8osSyy7nKwCz3k3Xq5LBtQ', cb)
	.mentions()
	.count()

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}
//post.pipe(process.stdout)