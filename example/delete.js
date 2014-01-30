var request = require('..')
var config = require('../test/config.json')

var client = request(config.meta, config.auth)
var req = client.delete('j3zIT8syGRRA8eO7p9Dm1w', cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}