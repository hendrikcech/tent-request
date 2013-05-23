var request = require('../request')
var meta = require('../test/config.json').meta
var auth = require('../test/config.json').auth

var client = request.createClient(metaPart, auth)
var query = client.queryPost()
  .limit(3)
	.send(function(err, res, body) {
		if(err) return console.error(err)
		console.log(res.statusCode)
		//console.log(body)
    	body['data'].forEach(function(bodi) { console.log(bodi.content) })
	})