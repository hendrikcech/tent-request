var hawk = require('hawk')
var debug = require('debug')('tent-request:batch')
var Multipart = require('multipart-stream')
var Dicer = require('dicer')
var parseHTTPResponse = require('http-string-parser').parseResponse
var parseUrl = require('url').parse
var STATUS_CODES = require('http').STATUS_CODES

var create = require('./create')
var del = require('./delete')
var get = require('./get')
var query = require('./query')
var update = require('./update')
var request = require('./request')
var utils = require('./utils')

module.exports = Batch
function Batch(meta, auth) {
	this.meta = meta
	this.auth = auth

	this._requests = {}
	this._order = 0
	this._mp = new Multipart()

	this.query = utils.constructQuery.call(this, handleConstructCB.bind(this))
	this.get = utils.constructGet.call(this, handleConstructCB.bind(this))
}

Batch.prototype = {
	create: function(type, metadata, content, cb) { 
		var opts = create(this.meta, type, metadata, content) 
		opts.cb = arguments[arguments.length-1]
		this._addRequestPart(opts)
		return this
	},
	update: function(id, parent, type, metadata, content, cb) {
		var opts = update(this.meta, id, parent, type, metadata, content)
		opts.cb = arguments[arguments.length-1]
		this._addRequestPart(opts)
		return this
	},
	delete: function(id, opts, cb) {
		var opts = del(this.meta, id, opts)
		opts.cb = arguments[arguments.length-1]
		this._addRequestPart(opts)
		return this
	}
}

function handleConstructCB(reqOpts, cb) {
	var opts = reqOpts
	opts.cb = cb
	this._addRequestPart(opts)
	return this
}

Batch.prototype._addRequestPart = function(req) {
	this._requests[this._order] = req
	req.id = this._order++

	if(this.auth) {
		var authHeader = hawk.client.header(req.url,
			req.method, { credentials: this.auth })
		if(authHeader.err) {
			throw new Error('request error: '+authHeader.err)
			return
		}
		req.headers['Authorization'] = authHeader.field
	}

	var part = {
		headers: {
			'Content-Type': 'application/http',
			'Content-ID': '<'+ req.id +'>'
		},
		body: buildHTTPBody(req)
	}

	this._mp.addPart(part)
}

Batch.prototype.end = function(cb) {
	debug('batch.end called')

	this.cb = cb || new Function

	if(this._order === 0) {
		return this.cb(null, { statusCode: 0, headers: {} }, [])
	}

	var batch = request({
		url: this.meta.servers[0].urls.batch,
		method: 'POST',
		headers: {
			'Accept': 'multipart/mixed',
			'Content-Type': 'multipart/mixed; boundary="'+this._mp.boundary+'"',
		},
		auth: this.auth,
		body: this._mp
	})
	.on('error', this.cb)
	.on('response', this._onBatchResponse.bind(this))

	return batch
}

function buildHTTPBody(part) {
	var nl = '\r\n'
	var body = ''

	var path = parseUrl(part.url).path

	// request
	body += part.method.toUpperCase() + ' ' + path + ' HTTP/1.1' + nl

	// request headers
	if(part.headers) {
		for(var header in part.headers) {
			body += header + ': ' + part.headers[header] + nl
		}
	}
	
	var length = Buffer.byteLength(part.body || '')
	body += 'Content-Length: ' + length + nl

	body += nl

	if(part.body) {
		body += part.body
	}

	body += nl

	return body
}

Batch.prototype._onBatchResponse = function(res) {
	debug(res.statusCode + ' response')

	var cb = this.cb

	// handle error
	if(res.statusCode < 200 || res.statusCode >= 300) {
		var data = ''
		res.on('data', function(d) {
			data += d
		}).on('end', function() {
			request.handleError(res, data.toString('utf8'), cb)
		})
		return
	}

	this.res = res
	this._responseParts = []
	var boundary = res.headers['content-type'].match(/boundary="(.*)"/i)[1]
	
	// parse multipart response
	var dicer = new Dicer({ boundary: boundary })
		.on('part', this._onResponsePart.bind(this))
		.on('finish', this._onResponseEnd.bind(this))
		.on('error', function(err) {
			debug('dicer.on error', err)
			cb(err)
		})

	res.pipe(dicer)
}

Batch.prototype._onResponsePart = function(partStream) {
	debug('dicer.on part')

	var part = {}
	var _requests = this._requests
	var _responseParts = this._responseParts
	var cb = function noop() {}

	// look up callback for response by content-id
	partStream.on('header', function(headers) {
		if(typeof headers['content-id'] !== 'undefined') {
			part.id = /<response-(.*)>/i.exec(headers['content-id'][0])[1]
			if(_requests[part.id] && _requests[part.id]['cb']) {
				cb = _requests[part.id]['cb']
			}
		}
	})

	var data = ''
	partStream.on('data', function(d) {
		data += d
	}).on('end', function() {
		// TOOD: handle error?
		var res = parseHTTPResponse(data.toString())
		part.statusCode = Number(res.statusCode)
		part.headers = res.headers
		part.body = res.body

		// call cb of individual request
		var res = {
			statusCode: part.statusCode,
			headers: part.headers
		}
		request.onResponse(request, res, part.body, cb)

		debug('dicer part', part)

		_responseParts.push(part)
	})
}

Batch.prototype._onResponseEnd = function() {
	debug('dicer.on end')

	// return result array in same order as requests were added to batch
	this._responseParts.sort(function(a, b) {
		if(a.id < b.id) return -1
		if(a.id > b.id) return 1
	})

	var responses = []

	this._responseParts.forEach(function(part) {
		var partRes = { statusCode: part.statusCode, headers: part.headers }
		request.onResponse(this._requests[part.id], partRes, part.body, partCb)

		// cb is called synchronous
		function partCb(err, res, body) {
			responses.push({ err: err, res: res , body: body })
		}
	}, this)

	this.cb(null, this.res, responses)
}