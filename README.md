# tent-request
A node.js module to perform requests against a [Tent](https://tent.io) server, which supports the current version 0.3.
Thanks to [browserify](https://github.com/substack/node-browserify) this module can also be used in the browser!

To fully support 0.3 there's still a lot to do. It would be awesome to see you helping! Take a look in the issues section of this repository and see what you can do.
Please open an issue if you find an unsupported feature or a bug. 

Please generally don't hesitate to open a issue or contact me via email, Tent (hendrik.tent.is) or IRC, if you have questions or ideas.

WARNING: The API is still very likely to change.

## install
With npm:
	
	npm install tent-request

# usage
	var request = require('tent-request')

Create a new client for each user with a meta post and optionally auth credentials.
`meta` should be the content part of the meta post returned by the Tent server (`meta.post.content`). An example can be found in the [config template](test/config.json.template).
`auth` should be an object with keys named `id` OR `access_token`, `key` OR `hawk_key` and `algorithm` OR `hawk_algorithm`.

	var client = request.createClient(meta, auth)

## methods
`client` exposes several functions to interact with the users' Tent server.
If you have questions regarding the specific behaviour of some of these setters, don't be afraid to look in the source, it's pretty basic.

### result (callback)
All functions optionally take a callback as the last argument, which gets called after the full response is received.
The `err` variable is null, unless `http.request()` throws an error, the status code is not 200 or the body contains an `error` key.
The `response` object is forwarded from the underlying `http.request()`.
`body` either contains the JSON decoded response or a number, if the count of posts was requested.

	function cb(err, response, body) {
		if(err) return console.error(err)
		console.log('response with ' + response.statusCode)
		console.log(body)
	}

Regardless of the callback, all functions return a readable stream.

	client.query().pipe(process.stdout)

### .query
This method communicates with the `posts_feed` server endpoint and can be used to filter posts by certain criteria. More information can be found [here](https://tent.io/docs/api#postsfeed).

	client.query([opts][, callback])

**Opts Object**

key | description | example
--- | --- | ---
profiles | Set to one or more of these values to get the relevant profiles: `entity`, `refs`, `mentions`, `permissions`, `parents` or `all`. `all` is an shortcut and replaced by the other values. | `{ profiles: ['entity', 'mentions'] }` `{ profiles: 'all' }`
maxRefs | Set the maximum number of included refs. | `{ maxRefs: 5 }`

**Setter**  
The posts can be filtered by the following parameters. The functions are chainable in any order.
`||` seperates different possible parameters; read `OR`.

function | description | example
--- | --- | ---
limit | Limit the number of posts returned. | `client.query.limit(2)`	
sortBy | Specify by which field the posts should be sorted. Possible values are `received_at`, `published_at`, `version.received_at` and `version.published_at`. | `client.query.sortBy('received_at')`
since | Return only posts since this point. Time in milliseconds since the Unix epoch. | `client.query.since(1373643809000)`
until | Return only posts until this point. Time in milliseconds since the Unix epoch. | `client.query.until(1373643814000)`
before | Return only posts before this point. Time in milliseconds since the Unix epoch. | `client.query.before(1373643909000)`
types | Specify the types of the returned posts. | `client.query.types('http://ty.pe')` `client.query.types(['http://ty.pe', 'https://another.type'])`
entities | Specify from which entities posts should be returned. | `client.query.entities('http://one.entity')` `client.query.entities(['https://or.more', 'http://than.one'])`
mentions | Query by mentions. Supports AND and OR operators. Entities in one array are connected by AND operators, commata represent ORs. | `client.query.mentions(['http://enti.ty' + '+id',/*AND*/ 'https://enti.ty'], /*OR*/ 'http://pet.er')`

**Count**  
To get the number of matched posts, call the subfunction `count`. Be aware that the actual posts won't be returned.

	client.query.count([callback])

### .get
Use this function to interact with a specific post from the [`post` server endpoint](https://tent.io/docs/api#post).
`get()` requires the `id` of the post to fetch. If no entity is passed as the second parameter, the function will try to get a post with the given id from the current entity.
	
	client.get(id[, entity][, opts][, callback])

**Opts Object**

key | description | example
--- | --- | ---
version | Set to interact with a specific version. By default the latest version will be picked. | `{ version: 'aB8mjnxlIeJ8n2tP5ztp'}`
profiles | Set to one or more of these values to get the relevant profiles: `entity`, `refs`, `mentions`, `permissions`, `parents` or `all`. `all` is an shortcut and replaced by the other values. | `{ profiles: ['entity', 'mentions'] }` `{ profiles: 'all' }`

**sub functions**  
These subfunctions take the same arguments as the base function.

function | description
--- | ---
client.get.mentions() | Get all posts that are mentioning the post with the given `id`.
client.get.versions() | Get all versions of the post with the given `id`.
client.get.childVersions() | Get all versions to which the post with the given `id` is the parent.

To get the count of matched posts, use .count().

	client.get.count('id')
	client.get.mentions.count('id')
	...

### .create
Use this function to create a new post. Optionally the constructor takes the `type` (e.g. `https://tent.io/types/status/v0`) or the whole post. Information about the post schema can be found [here](https://tent.io/docs/posts#post-schema).

	client.create([type || wholePostObject][, callback])

These setters can be chained in any order.

		.publishedAt(1373643809000)
		.type('https://tent.io/types/essay/v0')

You can either give one license url as a string or multiple in an array.

		.licenses('http://licen.se' || ['http://dowhat.ever', 'https://you.want'])


Populate the mentions array of the post.

		.mentions('http://enti.ty') // either mention a entity,
		.mentions('postID') // a post
		.mentions('http://enti.ty postID') // or a post by another entity

		// even multiple mentions in one call!
		.mentions(['http://enti.ty', 'postId', 'https://enti.ty postId'])

If you need to set the version, type or public status, pass a object containing one or more of these keys. Multiple mentions can be made by passing an array of these.

		.mentions({
			entity: 'http://entity.net',
			post: 'postID',
			version: 'versionHash'
			type: 'type',
			public: true
		})
		
Content can be set in two different ways: Either by passing an object with possibly multiple keys or by setting only one field through giving a key and the corresponding value.

		.content('key', 'value')
		.content({ text: 'Hi!', weather: 'great' })

By passing a boolean value you can set the `public` status (true -> public, false -> private).
Passing a string or an array of strings you can set the groups and entities to give permission to this post.
To set the post public status and permit some entities access, call the permissions function multiple times.

	 	.permissions(false)
	 	.permissions('https://enti.ty') // give this entity access
	 	.permissions(['groupID', 'http://enti.ty'])

### .update
This function creates new versions of posts.
The first argument is required and takes the id of the post to update.

A second argument is required, which is a reference to the parent post. You can pass either the version id of a parent version
or a full parent object, consisting of at least a `version` key and optionally `post` and `entity` keys.

	client.update(id, parentHashString || fullParentObject[, callback])

Parents can be also set in the same form with a dedicated function.

		.parents(parentHashString || fullParentObject)

All setters of the `create` function expect `publishedAt` can be used here too.  
Additionally these setters are available.

		.versionPublishedAt(1373643809000)
		.versionMessage('Awesome shiny new version.')

### .delete
This function can be used to delete specific posts. The `id` parameter is required.

	client.delete(id[, callback])
		.version('as8df89asdf76asdf9') // only delete a specific version
		.createDeletePost(false)

# test
Duplicate `test/config.json.template`, rename the file to `config.json` and populate it. Then do

	npm test

to run the tests.

# license
This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
