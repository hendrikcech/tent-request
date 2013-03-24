var http = require('http')
var https = require('https')
var qs = require('qs')
var crypto = require('crypto')
var urlModule = require('url')

"use strict"

module.exports = function(opt, callback, debug) { //method, url, auth, parameters,
	var authReq = false

	//validate options
	if(!opt.method) throw new Error("argument 'method' required")
	if(!opt.url) throw new Error("argument 'url' required")
	if(opt.auth) { 
		if(!opt.auth.mac_key || (!opt.auth.mac_key_id && !opt.auth.access_token))
			throw new Error("for auth, mac_key AND mac_key_id/access_token are required")
		if(!opt.auth.mac_key_id) opt.auth.mac_key_id = opt.auth.access_token
		authReq = true
		if(debug) console.log('AUTHENTICATED REQUEST')
	}
	
	var tentHeader = 'application/vnd.tent.v0+json'

	var reqOpt = urlModule.parse(opt.url)

	reqOpt.method = opt.method.toUpperCase()
	reqOpt.headers = {}
	reqOpt.headers.Accept = tentHeader

	if(opt.param) {
		if(reqOpt.method === 'GET') {
			var queryString = '?' + qs.stringify(opt.param)
			if(reqOpt.path === '/') reqOpt.path = queryString
			else reqOpt.path += queryString
		} else {
			reqOpt.headers['Content-Type'] = tentHeader
			reqOpt.body = JSON.stringify(opt.param) //belongs here?
		}
	}

	//breakpoint for no-auth requests
	if(!authReq) return makeReq(reqOpt, callback, debug)


	//timestamp
	var ts = Math.round(Date.now() / 1000)

	//nonce http://www.mediacollege.com/internet/javascript/number/random.html
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
	var nonce = ''
	for (var i=0; i<6; i++) {
		var rnum = Math.floor(Math.random() * chars.length)
		nonce += chars.substring(rnum,rnum+1)
	}

	if(!reqOpt.port) reqOpt.port = (reqOpt.protocol === 'https:') ? 443 : 80

	var normalizedRequestString = ""
		+ ts + '\n'
		+ nonce + '\n'
		+ reqOpt.method + '\n'
		+ reqOpt.path + '\n'
		+ reqOpt.hostname + '\n'
		+ reqOpt.port + '\n'
		+ '\n'

	var key = crypto.createHmac('SHA256', opt.auth.mac_key)
					.update(normalizedRequestString)
					.digest('base64')

	reqOpt.headers.Authorization = ''
		+ 'MAC id=\"' + opt.auth.mac_key_id + '\"'
		+ ', ts=\"' + ts + '\"'
		+ ', nonce=\"' + nonce + '\"'
		+ ', mac=\"' + key + '\"'

	makeReq(reqOpt, callback, debug)
}

function makeReq(reqOpt, callback, debug) {
	if(debug) console.log('FINAL REQOPTIONS:', reqOpt)

	var interface = (reqOpt.protocol === 'https:') ? https : http

	var req = interface.request(reqOpt, function(res) {
		if(debug) console.log('RESSTATUS:', res.statusCode)
		if(debug) console.log('RESHEADERS:', JSON.stringify(res.headers))

		if(res.statusCode !== 200)
			return callback(new Error('got bad statusCode: ' + res.statusCode))
		res.setEncoding('utf8')

		var data = ''
		res.on('data', function (chunk) {
			data += chunk
		})
		res.on('end', function() {
			callback(null, JSON.parse(data))
		})
	})

	req.on('error', function(err) {
		return callback(err)
	})

	if(reqOpt.body) req.write(reqOpt.body)
	req.end()
}