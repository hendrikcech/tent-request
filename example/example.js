var request = require('../request')

var optGET = {
	method: 'get',
	url: 'https://hendrik.tent.is/tent/posts',
	// auth: {
	// 	mac_key: 'asöldf',
	// 	mac_key_id: 'kkasfdksf'
	// },
	param: {
		limit: 2
	}
}

var optPOST = {
	method: 'post',
	url: 'https://hendrik.tent.is/tent/apps',
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

var optAuth = {
	method: 'put',
	url: 'https://hendrik.tent.is/tent/profile/https%3A%2F%2Ftent.io%2Ftypes%2Finfo%2Fbasic%2Fv0.1.0',
	auth: {
		mac_key: '',
		access_token: '',
	},
	param: {
		"avatar_url" : "http://www.gravatar.com/avatar/5a21fcfa05ac7d496a399e44c6cc60a8.png?size=200",
		"bio" : "",
		"birthdate" : "01.07.1995",
		"gender" : "",
		"location" : "Braunschweig, Germany",
		"name" : "Hendrik Cech"
	}
}

request(optAuth, function(err, res) {
	if(err) return console.log(err)
	console.log(res)
}, true)