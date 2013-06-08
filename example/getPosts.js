var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta)
var posts = client.getPosts(cb)
	//.limit(10)
	//.since(1369577987802)
	//.count()
	//.types(['hi', 'jo', 'ma'])
	.mentions(['http://enti.ty' + '+id',/*AND*/ 'https://enti.ty'], /*OR*/ 'http://pet.er')

console.log(posts.print())
	
function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}

//posts.pipe(process.stdout)