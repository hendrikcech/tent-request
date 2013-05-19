var request = require('../request')

var metaPart =  {
	"version": "0.3",
	"preference": 0,
	"urls": {
		"oauth_auth": "http://bb216a47d970.alpha.attic.is/oauth",
		"oauth_token": "http://bb216a47d970.alpha.attic.is/oauth/authorization",
		"posts_feed": "http://bb216a47d970.alpha.attic.is/posts",
		"post": "http://bb216a47d970.alpha.attic.is/posts/{entity}/{post}",
		"new_post": "http://bb216a47d970.alpha.attic.is/posts",
		"post_attachment": "http://bb216a47d970.alpha.attic.is/posts/{entity}/{post}/{version}/attachments/{name}",
		"attachment": "http://bb216a47d970.alpha.attic.is/attachments/{entity}/{digest}",
		"batch": "http://bb216a47d970.alpha.attic.is/batch",
		"server_info": "http://bb216a47d970.alpha.attic.is/server"
	}
}
var auth = {
	"access_token": "qUtGgNr7YTURDensMvGa1g",
	"hawk_key": "Oty-0oimG5qFVr6fnVL1mg",
	"hawk_algorithm": "sha256",
	"token_type": "https://tent.io/oauth/hawk-token"
}

var client = request.createClient(metaPart, auth)
var post = client.newPost('https://tent.io/types/app/v0#')
	.content({
		"name": "Example App",
		"url": "https://app.example.com",
		"post_types": {
		  "read": [
		    "https://tent.io/types/app/v0"
		  ],
		  "write": [
		    "https://tent.io/types/status/v0",
		    "https://tent.io/types/photo/v0"
		  ]
		},
		"redirect_uri": "https://app.example.com/oauth"
	})
	.permissions(false)
	.create(function(err, res, body) {
		//if(err) console.error(err)
		//console.log(res.statusCode)
		//console.log(body)
	})

post.on('error', function(err) {console.error(err)})
post.on('response', function(res) {console.log(res.statusCode)})
post.on('body', function(body) {console.log(body)})