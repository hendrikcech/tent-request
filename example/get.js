var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(meta, auth)
var post = client.get('JumBJkaEJO6cXA90g8mumg', cb)
	.childVersions('5e0ada8f0602e5dc3dfefb501967e79999beac23f13b51d60948169551a4a677')
	.count()

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}
//post.pipe(process.stdout)