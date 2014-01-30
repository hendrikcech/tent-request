var request = require('./request')
var utils = require('./utils')
var querystring = require('querystring')

module.exports = function(url, auth, entity, mode, query, opts, cb) {
	var query = query || {}
	var method = (mode[0] === 'count') ? 'HEAD' : 'GET'

	var query = (query) ? module.exports.buildQuery(query) : {}

	if(opts && opts.profiles)
		query.profiles = utils.setProfiles(opts.profiles)
	if(opts && opts.maxRefs)
		query.max_refs = opts.maxRefs

	var reqUrl = url
	
	var qs = querystring.stringify(query)
	//qs = qs.replace(/%2C/g, ',')
	//qs = qs.replace(/%2B/g, '+')
	if(qs) reqUrl += '?' + qs

	var req = request(reqUrl, method, auth, cb)
	
	req.setHeader('Accept', 'application/vnd.tent.posts-feed.v0+json')

	req.end()

	return req
}

module.exports.checkArgs = function(query, opts, cb) {
	query = query || null
	opts = opts || null
	cb = cb || null

	if(typeof opts === 'function') {
		cb = opts
		opts = null
	}

	if(typeof query === 'function') {
		cb = query
		query = null
	} else if(query && typeof query === 'object' && !Array.isArray(query)) {
		var key = Object.keys(query)[0]
		var inOpts = key === 'profiles' || key === 'maxRefs'
		if(inOpts) {
			opts = query
			query = null
		}
	} else if(query) {
		throw new Error('query parameters must be specified by an object')
	}

	return [query, opts, cb]
}

module.exports.buildQuery = function(query) {
	var res = {}

	for(var key in query) {
		var val = query[key]

		if(key === 'types' || key === 'entities') {
			// either string or array with string

			if(Array.isArray(val)) {
				res[key] = val.join()
			} else {
				res[key] = val
			}

		} else if(key === 'mentions') {
			res.mentions = []

			/*
			var query = {
				// single
				mentions: 'https://enti.ty',

				// OR
				mentions: ['https://enti.ty', 'http://enti.ty']

				// AND
				mentions: [['https://entity', 'http://enti.ty']]

				// AND and OR
				mentions: [['https://entity', 'http://enti.ty'], 'http://y.yo']
			}
			*/

			if(typeof val === 'string') {
				res.mentions.push(val)
				continue
			}

			for(var i = 0; val.length > i; i++) {
				var arg = val[i]

				if(Array.isArray(arg))  //AND operator
					res.mentions.push(arg.join(','))
				else if(typeof arg === 'string') //OR operator
					res.mentions.push(arg)
			}
		} else {
			res[key] = val
		}
	}

	return res
}