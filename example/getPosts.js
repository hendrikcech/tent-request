var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta, auth)
var posts = client.getPosts(cb)
	.limit(2)
	.since(1369577987802)
	
function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}

posts.pipe(process.stdout)