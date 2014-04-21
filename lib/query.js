var request = require('./request')
var utils = require('./utils')
var querystring = require('querystring')
var debug = require('debug')('tent-request:query')

/**
 * Query the posts feed with different parameters.
 * @param  {object} meta
 * @param  {array} mode
 * @param  {object} query
 * @param  {object} opts
 * @property {string|array} profiles
 * @property {number} maxRefs
 * @return {object} reqOpts
 */
module.exports = function(meta, mode, query, opts) {
	if(query && typeof query === 'object' && !Array.isArray(query)) {
		var key = Object.keys(query)[0]
		var inOpts = key === 'profiles' || key === 'maxRefs'
		if(inOpts) {
			opts = query
			query = null
		}
	} else if(query) {
		throw new Error('query parameters must be specified by an object')
	}

	var query = (query) ? module.exports.buildQuery(query) : {}
	var method = (mode[0] === 'count') ? 'HEAD' : 'GET'
	var url = meta.servers[0].urls.posts_feed

	opts = opts || {}
	if(opts.profiles)
		query.profiles = utils.setProfiles(opts.profiles)
	if(opts.maxRefs)
		query.max_refs = opts.maxRefs
	
	var qs = querystring.stringify(query)
	//qs = qs.replace(/%2C/g, ',')
	//qs = qs.replace(/%2B/g, '+')
	if(qs) url += '?' + qs

	var reqOpts = {
		url: url,
		method: method,
		headers: {
			'Accept': 'application/vnd.tent.posts-feed.v0+json'
		}
	}

	debug('', reqOpts)

	return reqOpts
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