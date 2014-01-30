var request = require('..')
var config = require('../tests/config')

var client = request(config.meta, config.auth)

var post = client.create('https://tent.io/types/status/v0#',
	{ text: 'hello form tent-request!' }, cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}