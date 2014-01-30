module.exports.meta = {
	"post": {
		"content": {
			"entity": "https://randomuser.cupcake.is",
			"profile": {},
			"servers": [
				{
					"version": "0.3",
					"preference": 0,
					"urls": {
						"oauth_auth": "https://randomuser.cupcake.is/tent/oauth",
						"oauth_token": "https://randomuser.cupcake.is/tent/oauth/authorization",
						"posts_feed": "https://randomuser.cupcake.is/tent/posts",
						"post": "https://randomuser.cupcake.is/tent/posts/{entity}/{post}",
						"new_post": "https://randomuser.cupcake.is/tent/posts",
						"post_attachment": "https://randomuser.cupcake.is/tent/posts/{entity}/{post}/attachments/{name}",
						"attachment": "https://randomuser.cupcake.is/tent/attachments/{entity}/{digest}",
						"batch": "https://randomuser.cupcake.is/tent/batch",
						"server_info": "https://randomuser.cupcake.is/tent/server",
						"discover": "https://randomuser.cupcake.is/tent/discover"
					}
				}
		  ]
		},
		"entity": "https://randomuser.cupcake.is",
		"id": "meta",
		"published_at": 1390441025049,
		"type": "https://tent.io/types/meta/v0#",
		"version": {
			"id": "sha512t256-daf071f8f9a790e6c5936dc302c669a",
			"published_at": 1390441025049
		}
	}
}

module.exports.auth = {
	hawk: {
		"access_token": "HwwboqGO3jBUNKQ",
		"hawk_key": "1334b639b059f8fff9e35efbee5ab8ad8ca95c28b8f29ae6f",
		"hawk_algorithm": "sha256",
		"token_type": "https://tent.io/oauth/hawk-token"
	},
	idkey: {
		"id": "HwwboqQO3jBUNKQ",
		"key": "1334b639b08d6334c4fff9e35efbee5ab8ad8ca95c28b8f29ae6f",
		"hawk_algorithm": "sha256",
		"token_type": "https://tent.io/oauth/hawk-token"
	 }
}