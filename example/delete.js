var request = require('../request')
var config = require('../test/config.json')

var client = request.createClient(config.meta, config.auth)
var req = client.delete('9w3naYJZ1m2WX7dvGz2lDA', cb)
	//.version('732deac42a276d9edf5')
	//.createDeletePost(false)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}
//req.pipe(process.stdout)