var http = require('http')
var https = require('https')
var urlMod = require('url')
var hawk = require('hawk')
var debug = require('debug')('tent-request:request')
var Stream = require('stream').Stream

module.exports = request
module.exports.onResponse = onResponse
module.exports.handleError = handleError

/**
 * Performes a request.
 * @param  {object}   opts
 * @param  {Function} cb
 * @return {http.ClientRequest}
 */
function request(opts, cb) {
	cb = (typeof cb === 'function') ? cb : null
	
	var withCb = cb ? 'with cb' : 'without cb'
	debug('request (' + withCb +')\n', opts)

	var reqOpts = urlMod.parse(opts.url)

	var protocol = reqOpts.protocol || ''
	var iface = protocol === 'https:' ? https : http

	reqOpts.method = opts.method
	reqOpts.port = Number(reqOpts.port) || (protocol === 'https:' ? 443 : 80)
	reqOpts.withCredentials = false

	reqOpts.headers = opts.headers
	if(opts.auth) {
		var authHeader = hawk.client.header(opts.url, opts.method,
			{ credentials: opts.auth })
		if(authHeader.err) {
			if(cb) cb(new Error('request error: ' + authHeader.err))
			else throw new Error('request error: ' + authHeader.err)
		}
		reqOpts.headers['Authorization'] = authHeader.field
	}

	debug('reqOpts\n', reqOpts)

	var req = iface.request(reqOpts)

	if(opts.body instanceof Stream) {
		opts.body.pipe(req)
	} else {
		req.end(opts.body)
	}

	if(!cb) return req

	req.on('error', function(err) {
		cb(err)
	})
	
	req.on('response', function(res) {
		debug(res.statusCode + ' response:\n', res.headers)

		var data = ''
		res.on('data', function(d) {
			data += d
		})

		res.on('end', function() {
			var body = data ? data.toString('utf8') : ''
			onResponse(opts, res, body, cb)
		})

	})

	return req
}

function onResponse(opts, res, body, cb) {
	var error = []
	if(res.statusCode < 200 || res.statusCode >= 300) {
		return handleError(res, body, cb)
	}

	if(opts.method === 'HEAD') {
		body = Number(res.headers.count)
	}

	if(body && typeof body === 'string') {
		try {
			body = JSON.parse(body)
		} catch(e) {
			e.message = 'error parsing response body: ' + e.message
			return cb(e)
		}

		var context = {}
		if(body.pages) {
			for(var key in body.pages) {
				var pageOpts = JSON.parse(JSON.stringify(opts))
				pageOpts.url = pageOpts.url.split('?')[0] + body.pages[key]

				context[key] = request.bind(null, pageOpts)
			}
		}
	}

	debug('res body:\n', body)
	cb.call(context, null, res, body)
}

function handleError(res, body, cb) {
	var message = res.statusCode + ' ' + http.STATUS_CODES[res.statusCode]

	if(body) {
		message += ': ' + body
	}

	cb(message, res, body)
}