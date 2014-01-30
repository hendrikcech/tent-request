/*
you can use tent-discover and tent-auth to obtain this information from
your test tent server
*/
module.exports = {
	"meta": {
		"entity": "",
		"servers": [{
			"version": "",
			"preference": 0,
			"urls": {
				"oauth_auth": "",
				"oauth_token": "",
				"posts_feed": "",
				"post": "",
				"new_post": "",
				"post_attachment": "",
				"attachment": "",
				"batch": "",
				"server_info": ""
			}
		 }]
	},
	"auth": {
		"access_token": "",
		"hawk_key": "",
		"hawk_algorithm": "",
		"token_type": ""
	}
}

// used by tests
module.exports.type = 'https://custom.type/v0#'