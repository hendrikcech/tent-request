var request = require('../request')
var config = require('../test/config.json')

var client = request.createClient(config.meta, config.auth)
var posts = client.query({ profiles: 'all', maxRefs: 5 }, cb)

	
function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(require('util').inspect(body, { depth: 2, colors: true }))
}
//posts.pipe(process.stdout)