var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta)
var posts = client.query(cb)
	.limit(1)
	//.since(1369577987802)
	//.count()
	
function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body.posts[0])
}

//posts.pipe(process.stdout)