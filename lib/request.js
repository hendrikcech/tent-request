var http = require('http')
var https = require('https')
var urlMod = require('url')
var hawk = require('hawk')
var concat = require('concat-stream')

module.exports = function(url, method, auth, cb) {
	var u = urlMod.parse(url)

	var protocol = u.protocol || ''
	var iface = protocol === 'https:' ? https : http

	var req = iface.request({
		scheme: protocol.replace(/:$/, ''),
		method: method,
		host: u.hostname,
		port: Number(u.port) || (protocol === 'https:' ? 443 : 80),
		path: u.path,
		agent: false,
		headers: {}
	})

	if(auth) {
		var auth = hawk.client.header(url, method, { credentials: auth })
		req.setHeader('Authorization', auth.field)
	}

	if(!cb) return req

	var errord = false // needed?
	req.on('error', function(err) {
		errord = true
		cb(err)
	})
	
	req.on('response', function(res) {
		if(errord) return
		
		var error = []
		if(res.statusCode < 200 || res.statusCode >= 300) {
			error.push(res.statusCode)
			
			// workaround: http-browserify does not expose those
			if(http.STATUS_CODES) {
				error[0] += ' ' + http.STATUS_CODES[res.statusCode]
			}
		}

		var body = null

		if(method === 'HEAD')
			body = Number(res.headers.count)

		res.pipe(concat({ encoding: 'string' }, function(data) {
			if(!body) {
				try {
					body = JSON.parse(data)
				} catch(e) {}
			}

			if(body && body.error) error.push(body.error)

			if(error.length > 0) error = error.join(': ')
			else error = null

			cb(error, res, body)
		}))
	})

	return req
}

//returns http.ClientRequest