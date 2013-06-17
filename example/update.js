var request = require('../request')
var config = require('../test/config.json')

var client = request.createClient(config.meta, config.auth)
var req = client.update('JumBJkaEJO6cXA90g8mumg',
	'5e0ada8f0602e5dc3dfefb501967e79999beac23f13b51d60948169551a4a677', cb)
	.type('')
	//.message('Update, update!')
	.content({ name: 'New new Name!' })

function cb(err, res, body) {
	if(err) return console.error(err)
	console.log(res.statusCode)
	console.log(body)
}
//req.pipe(process.stdout)