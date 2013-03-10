var request = require('request')
var qs = require('qs')
var crypto = require('crypto')

module.exports = function(method, url, auth, parameters, callback, debug) {
	var authReq = false

	if(!method) throw new Error("argument 'method' required")
	if(!url) throw new Error("argument 'url' required")
	if(auth) {
		if(!auth.mac_key || !auth.mac_key_id) throw new Error("for auth, mac_key AND mac_key_id are required")
		authReq = true
		if(debug) console.log('auth request!')
	}
	
	var tentHeader = 'application/vnd.tent.v0+json'

	var reqOpt = {
		'method': method,
		'url': url,
		'headers': {
			'Accept': tentHeader
		}
	}

	if(parameters) {
		var method = method.toUpperCase()
		if(method === 'GET') {
			reqOpt.url += '?' + qs.stringify(parameters)
		} else {
			reqOpt.headers['Content-Type'] = tentHeader
			reqOpt.body = JSON.stringify(parameters)
		}
	}

	if(!authReq) return makeReq(reqOpt, debug, callback) //breakpoint for no-auth requests

	reqOpt.headers['Authorization'] = 'MAC '

	var ts = Math.round(Date.now() / 1000)
	reqOpt.headers['Authorization'] += 'ts=\"' + ts + '\"'

	//create nonce http://www.mediacollege.com/internet/javascript/number/random.html
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
	var nonce = ''
	for (var i=0; i<6; i++) {
		var rnum = Math.floor(Math.random() * chars.length)
		nonce += chars.substring(rnum,rnum+1)
	}
	reqOpt.headers['Authorization'] += ', nonce=\"'+ nonce +'\"'


	/*host - path splitting out of url
		eg:
			url: https://hendrik.tent.is/tent/authorize
			host: hendrik.tent.is
			path: /tent/authorize
	*/
	var urlWithout = url.replace(/(https:\/\/|http:\/\/)/g, '') // => hendrik.tent.is/tent/authorize
	var parts = urlWithout.split('/')							// => [hendrik.tent.is, tent, authorize]
	var host = parts[0]											// hendrik.tent.is -> READY

	if(parts.length > 0) {
		parts.splice(0, 1)										// remove first element => [tent, authorize]
		var path = '/' + parts.join('/')						// => /tent/authorize	
	}

	if(/^https:\/\//.test(url)) {								// => https
		var port = 443
	} else {													// => http
		var port = 80
	}

	var normalizedRequestString = ""
		+ ts + '\n'
		+ nonce + '\n'
		+ method + '\n'
		+ path + '\n'
		+ host + '\n'
		+ port + '\n'
		+ '\n'
	if(debug) console.log('reqString:\n'+normalizedRequestString)	

	var key = crypto.createHmac('SHA256', auth.mac_key).update(normalizedRequestString).digest('base64')

	reqOpt.headers['Authorization'] = 'MAC id=\"'+auth.mac_key_id+'\", ts=\"'+ts+'\", nonce=\"'+nonce+'\", mac=\"'+key+'\"'

	makeReq(reqOpt, debug, callback)
}

function makeReq(reqOpt, debug, callback) {
	if(debug) console.log('final reqOptions:\n' + reqOpt)
	request(reqOpt, function(err, resp, body) {
		if(err) return callback(err)
		if(body) body = JSON.parse(body)
		callback(null, body, resp)
	})
}
