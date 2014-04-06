var request = require('./request')
var utils = require('./utils')
var querystring = require('querystring')
var debug = require('debug')('tent-request')

module.exports = function(url, auth, mode, id, entity, opts, cb) {
	var acceptHeader = 'application/vnd.tent.post.v0+json'
	switch(mode[0]) {
		case 'mentions':
			acceptHeader = 'application/vnd.tent.post-mentions.v0+json'
		break
		case 'versions':
			acceptHeader = 'application/vnd.tent.post-versions.v0+json'
		break
		case 'childVersions':
			acceptHeader = 'application/vnd.tent.post-children.v0+json'
		break
	}

	var method = 'GET'
	if(mode[1] === 'count') {
		method = 'HEAD'
	}

	var query = {}
	if(opts && opts.version)
		query.version = opts.version
	if(opts && opts.profiles)
		query.profiles = utils.setProfiles(opts.profiles)

	var encEntity = encodeURIComponent(entity)
	var encID = encodeURIComponent(id)

	var reqUrl = url.replace('{entity}', encEntity).replace('{post}', encID)
	
	var qs = querystring.stringify(query)
	//qs = qs.replace(/%2C/g, ',')
	//qs = qs.replace(/%2B/g, '+')
	if(qs) reqUrl += '?' + qs

	var req = request(reqUrl, method, auth, cb)
	
	req.setHeader('Accept', acceptHeader)

	req.end()

	if(req._headers) debug('req headers:\n', req._headers)

	return req
}

module.exports.checkArgs = function(id, entity, opts, cb) {
	entity = entity || null
	opts = opts || null
	cb = cb || null

	if(!id) throw new Error('id required')

	if(typeof opts === 'function') {
		cb = opts
		opts = null
	}

	if(typeof entity === 'object') {
		opts = entity
		entity = null
	} else if(typeof entity === 'function') {
		cb = entity
		entity = null
	}

	return [id, entity, opts, cb]
}