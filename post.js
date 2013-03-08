var request = require('request')
var qs = require('qs')

module.exports = function(method, url, parameters, callback) {
	if(!method) throw new Error("argument 'method' is required")
	if(!url) throw new Error("argument 'url' is required")

	var reqOpt = {
		'method': method,
		'url': url,
		'headers': {
			'Accept': 'application/vnd.tent.v0+json'
		}
	}

	if(parameters) {
		method.toLowerCase()
		if(method === 'get') {
			reqOpt.url += '?' + qs.stringify(parameters)
			console.log(reqOpt.url)
		} else {
			reqOpt.headers['Content-Type'] = 'application/vnd.tent.v0+json'
			reqOpt.body = JSON.stringify(parameters)
		}
	}
	request(reqOpt, function(err, res, body) {
		if(err) return callback(err)
		callback(null, body)
	})
}