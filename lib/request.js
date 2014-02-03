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
		var authHeader = hawk.client.header(url, method, {credentials: auth})
		req.setHeader('Authorization', authHeader.field)
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

		var concatStream = concat({ encoding: 'string' }, function(data) {
			// check server authorization header
			if(auth) {
				/*if data is empty (e.g. after head requests),
				hawk returns false for valid server-auth headers
				if payload is set to a falsy value.
				as a fix just pass undefined instead of an object.*/
				var opts = undefined
				if(data) opts = { payload: data}
				
				var isValid = hawk.client.authenticate(res, auth,
					authHeader.artifacts, opts)
				if(!isValid) {
					error.push('Response payload validation failed')
				}
			}

			if(!body) {
				try {
					body = JSON.parse(data)
				} catch(e) {}
			}

			if(body && body.error) error.push(body.error)

			if(error.length > 0) error = error.join(': ')
			else error = null

			var context = {}
			if(body && body.pages) {
				for(var key in body.pages) {
					// replace query part of the original req url
					u.search = body.pages[key]
					var pageUrl = urlMod.format(u)

					// temporary fix:
					// http-browserify doesn't expose this function
					var acceptHeader = (req.getHeader) ? req.getHeader('accept') : ''

					context[key] = getPage.bind(null,
						acceptHeader, pageUrl, method, auth)
				}
			}

			cb.call(context, error, res, body)
		})

		res.pipe(concatStream)
	})

	return req //returns http.ClientRequest
}

function getPage(acceptHeader, url, method, auth, cb) {
	var req = module.exports(url, method, auth, cb)
	
	if(acceptHeader)
		req.setHeader('Accept', acceptHeader)

	req.end()

	return req
}