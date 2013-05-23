var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(metaPart, auth)
var post = client.newPost('https://tent.io/types/status/v0#')
	.content({
		"text": "testTESTtestTEST"
	})
	.create(function(err, res, body) {
		if(err) console.error(err)
		console.log(res.statusCode)
		console.log(body)
	})
