var request = require('..')
var config = require('../tests/config')

var client = request(config.meta, config.auth)

var attachment = {
	name: 'photo.jpg',
	type: 'image/jpeg',
	category: 'photo[0]',
	size: 33920 // required, if data is stream
	data: 'pretendtobeaphoto' // or stream or buffer
}

var post = client.create('https://tent.io/types/status/v0#',
	{ attachments: attachment },
	{ text: 'hello form tent-request!' }, cb)

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}