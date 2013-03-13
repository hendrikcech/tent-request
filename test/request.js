var test = require('tap').test
var request = require('../request')

test('get request with options (/followings)', function(t) {
	request('get', 'https://hendrik.tent.is/tent/followings', null, {limit: 2}, function(err, res) {
		t.ok(!err, 'error returned: '+err)
		t.ok(res, 'no result returned')
		t.type(res, 'object', 'result typeof object')
		t.end()
	})
})

test('post request (/apps)', function(t) {
	var app = {
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

	request('post', 'https://hendrik.tent.is/tent/apps', null, app, function(err, res) {
		t.ok(!err, 'error returned: '+err)
		t.ok(res, 'no result returned')
		t.type(res, 'object', 'result typeof object')
		t.end()
	})
})

test('head request (entity)', function(t) {
	request('head', 'https://hendrik.tent.is', null, null, function(err, body, resp) {
		t.ok(!err, 'error returned: '+err)
		t.ok(resp, 'no result returned')
		t.type(resp, 'object', 'result typeof object')
		t.end()
	})
})