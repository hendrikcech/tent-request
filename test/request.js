var vows = require('vows')
var assert = require('assert')
var request = require('../request')
var config = require('./config')

function assertError() {
	return function(err, res, body) {
		assert.isNull(err)
	}
}
function assertResponse() {
	return function(err, res, body) {
		assert.equal(typeof body, 'object')
	}
}
function assertResponseContent(keys) {
	return function(err, res, body) {
		keys.map(function(key) {
			assert.include(body, key)
		})
	}
}

vows.describe('Request resources').addBatch({
	'Check config file': {
		'config file loaded': function() {
			assert.isObject(config)
		},
		'all values set': function() {
			assert.isNotEmpty(config.server)
			assert.isNotEmpty(config.auth)
			assert.isNotEmpty(config.auth.mac_key)
			assert.isNotEmpty(config.auth.access_token)
		}
	}
}).addBatch({
	'GET with parameter (/posts)': {
		topic: function() {
			var opt = {
				method: 'get',
				url: config.server + '/posts',
				param: {
					limit: 2
				}
			}
			request(opt, this.callback)
		},

		'returns no error': assertError(),
		'returns object (no string)': assertResponse(),
		'returns 2 posts': function(err, res, posts) {
			assert.equal(Object.keys(posts).length, 2)
		}
	},
	'POST with parameters (/apps)': {
		topic: function() {
			var opt = {
				method: 'post',
				url: config.server + '/apps',
				param: {
					"name": "FooApp",
					"description": "Does amazing foos with your data",
					"url": "http://example.com",
					"icon": "http://example.com/icon.png",
					"redirect_uris": [
					  "https://app.example.com/tent/callback"
					],
					"scopes": {
					  "write_profile": "Uses an app profile section to describe foos",
					  "read_followings": "Calculates foos based on your followings"
					}
				}
			}
			request(opt, this.callback)
		},

		'returns no error': assertError(),
		'returns object (no string)': assertResponse(),
		'response content seems to be valid': assertResponseContent(
			['name', 'scopes', 'icon']
		)
	},
	'PUT with parameters and authentication (/profile)': {
		topic: function() {
			var opt = {
				method: 'put',
				url: config.server + '/profile/https%3A%2F%2Ftent.io%2Ftypes%2Finfo%2Fbasic%2Fv0.1.0',
				auth: config.auth,
				param: {
					"avatar_url" : "http://www.gravatar.com/avatar/5a21fcfa05ac7d496a399e44c6cc60a8.png?size=200",
					"bio" : "",
					"birthdate" : "01.07.1995",
					"gender" : "",
					"location" : "Braunschweig, Germany",
					"name" : "Hendrik Cech"
				}
			}
			request(opt, this.callback)
		},

		'returns no error': assertError(),
		'returns object (no string)': assertResponse(),
		'response content seems to be valid': assertResponseContent(
			['https://tent.io/types/info/basic/v0.1.0']
		)
	}
}).export(module)