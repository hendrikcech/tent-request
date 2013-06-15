var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta, auth)
var post = client.get('http://bb216a47d970.alpha.attic.is', 'rEjHpSrWSu0GigZPJnCxRQ', cb)
	//.delete()
	//.count()

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}
//post.pipe(process.stdout)