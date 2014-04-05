var http = require('http')
var https = require('https')
var urlMod = require('url')
var hawk = require('hawk')
// var concat = require('concat-stream')
var debug = require('debug')('tent-request')

module.exports = function(url, method, auth, cb) {
	var reqOpts = urlMod.parse(url)

	var protocol = reqOpts.protocol || ''
	var iface = protocol === 'https:' ? https : http

	reqOpts.method = method
	reqOpts.port = Number(reqOpts.port) || (protocol === 'https:' ? 443 : 80)
	reqOpts.withCredentials = false

	var req = iface.request(reqOpts)

	debug(method, url)
	debug('auth:\n', auth)
	debug('req:\n', reqOpts)

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
		debug('response header:\n', res.headers)

		if(errord) return
		
		var error = []
		if(res.statusCode < 200 || res.statusCode >= 300) {
			var m = res.statusCode + ' ' + http.STATUS_CODES[res.statusCode]
			error.push(m)
		}

		var body = null

		if(method === 'HEAD')
			body = Number(res.headers.count)

		var data = ''
		res.on('data', function(d) {
			data += d
		})

		res.on('end', function() {
			data = data.toString('utf8')

			if(!body) {
				try {
					body = JSON.parse(data)
				} catch(e) {}
			}

			if(body && body.error) error.push(body.error)

			if(error.length > 0) {
				error = error.join(': ')
				debug(error)
			} else {
				error = null
			}

			var context = {}
			if(body && body.pages) {
				for(var key in body.pages) {
					// replace query part of the original req url
					reqOpts.search = body.pages[key]
					var pageUrl = urlMod.format(reqOpts)

					// temporary fix:
					// http-browserify doesn't expose this function
					var acceptHeader = (req.getHeader) ? req.getHeader('accept') : ''

					context[key] = getPage.bind(null,
						acceptHeader, pageUrl, method, auth)
				}
			}

			debug('res body:\n', body)
			cb.call(context, error, res, body)
		})

		// res.pipe(concatStream)
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