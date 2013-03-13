var request = require('request')
var qs = require('qs')
var crypto = require('crypto')
var urlModule = require('url')

module.exports = function(method, url, auth, parameters, callback, debug) {
	var authReq = false

	if(!method) throw new Error("argument 'method' required")
	if(!url) throw new Error("argument 'url' required")
	if(auth) { 
		if(!auth.mac_key || (!auth.mac_key_id && !auth.access_token))
			throw new Error("for auth, mac_key AND mac_key_id/access_token are required")
		if(!auth.mac_key_id) auth.mac_key_id = auth.access_token
		authReq = true
		if(debug) console.log('auth request:')
		if(debug) console.log(auth)
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

	//breakpoint for no-auth requests
	if(!authReq) return makeReq(reqOpt, debug, callback)

	//timestamp
	var ts = Math.round(Date.now() / 1000)

	//nonce http://www.mediacollege.com/internet/javascript/number/random.html
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
	var nonce = ''
	for (var i=0; i<6; i++) {
		var rnum = Math.floor(Math.random() * chars.length)
		nonce += chars.substring(rnum,rnum+1)
	}

	var parsedUrl = urlModule.parse(url)
	if(!parsedUrl.port) parsedUrl.port = (parsedUrl.protocol === 'https:') ? 443 : 80

	var normalizedRequestString = ""
		+ ts + '\n'
		+ nonce + '\n'
		+ method + '\n'
		+ parsedUrl.path + '\n'
		+ parsedUrl.hostname + '\n'
		+ parsedUrl.port + '\n'
		+ '\n'
	if(debug) console.log('reqString:\n'+normalizedRequestString)	

	var key = crypto.createHmac('SHA256', auth.mac_key).update(normalizedRequestString).digest('base64')

	reqOpt.headers['Authorization'] = 'MAC id=\"'+auth.mac_key_id+'\", ts=\"'+ts+'\", nonce=\"'+nonce+'\", mac=\"'+key+'\"'

	makeReq(reqOpt, debug, callback)
}

function makeReq(reqOpt, debug, callback) {
	if(debug) {
		console.log('final reqOptions:')
		console.log(reqOpt)
	}
	request(reqOpt, function(err, resp, body) {
		if(err) return callback(err)
		if(typeof body === 'string') {
			body = JSON.parse(body)
			if(body.error) return callback(body.error)
		}
		callback(null, body, resp)
	})
}
