# tent-request
A node.js module to perform requests against a [Tent](https://tent.io) server, which supports the current version 0.3.
Thanks to [browserify](https://github.com/substack/node-browserify) this module can be also used in the browser!

There's still a lot to do, to fully support 0.3. I would be awesome if you could help! Take a look in the issues section of this repository and see what you can do.

Please don't hesitate to open a issue or contact me via email, Tent (hendrik.tent.is) or IRC, if you have questions or ideas.

## install
With npm:
	
	npm install tent-request

# usage
	var request = require('tent-request')

Create a new client for each user with a meta post and optionally auth credentials.
`meta` should be the content part of the meta post returned by the Tent server (`meta.post.content`).
`auth` should be an object with keys named `id` OR `access_token`, `key` OR `hawk_key` and `algorithm` OR `hawk_algorithm`.

	var client = request.createClient(meta, auth)

## methods
`client` exposes several APIs to interact with the users' Tent server.
If you have questions regarding the specific behaviour of some of these setters, don't be afraid to look in the source, it's pretty basic.

You can pass `null` to pretty much all these setters to remove the corresponding content again.

### result (callback)
All functions optionally take a callback as the last argument, which gets called after the full response is received.
The `err` variable is null, unless `http.request()` throws an error, the status code is not 200 or the body contains an `error` key.
The `response` object is forwarded from the underlying `http.request()`
`body` either contains the JSON decoded response or a number, if a `count()` method was used.

	function cb(err, response, body) {
		if(err) return console.error(err)
		console.log('response with ' + response.statusCode)
		console.log(body)
	}

Regardless of the callback, all functions return a readable stream, so that you can pipe the response wherever you want.

	client.query().pipe(process.stdout)

### .query
This method communicates with the `posts_feed` server API and can be used to filter posts by certain criteria. More information [here](https://tent.io/docs/api#postsfeed). The parameters can be chained any order.
`||` seperates different possible parameters; read `OR`.

	client.query([callback])
		.limit(Number)
		.sortBy('received_at' || 'published_at'
			|| 'version.received_at' || 'version.published_at')
		.since(Number)
		.until(Number)
		.before(Number)

You can give these two functions either one parameters in form of a string or multiple as an array.

		.types('http://ty.pe' || ['http://ty.pe', 'https://another.type'])
		.entities('http://one.entity' || ['https://or.more', 'http://than.one'])

You can query for mentioned entities with AND and OR operators. Entities in one array are connected by AND operators, commata represent ORs.

		.mentions(['http://enti.ty' + '+id',/*AND*/ 'https://enti.ty'],
			/*OR*/ 'http://pet.er')

To get the count of matched posts, chain this function. Be aware, that the actual posts won't be returned!
		
		.count()

### .get
Use this function to get a specific post from the [`post` server endpoint](https://tent.io/docs/api#post).
`get()` requires the `id` of the post to get. If no entity is passed as the second parameter, the function will try to get a post with the given id from  the current entity.
	
	client.get(id[, entity][, callback])

Only one or none of the following functions can be used per request.

		.mentions() // get posts mentioning the requested post
		.versions() // get all versions of the requested post
		.childVersions() // get all versions to which this post is the parent

To get the count of matched posts, chain .count().

		.count()

### .create
Use this function to create a new post. Optionally the constructor takes the `type` (e.g. `https://tent.io/types/status/v0`) or the whole post. Information about the post schema can be found [here](https://tent.io/docs/posts#post-schema).

	client.create(type || wholePostObject[, callback])

These setters can be chained in any order.

		.publishedAt(Number)
		.type(String)

You can either give one license url as a string or multiple in an array.

		.licenses('http://licen.se' || ['http://do.what', 'https://you.want'])

None of these keys are required, so set only the ones you want to. Multiple mentions can be given by passing an array of these objects.

		.mentions({
			entity: 'http://entity.net',
			post: 'postID',
			version: 'versionHash'
			type: 'type',
			public: true
		})

TODO CONTENT
		
		.content((String(key), String(val)) || Object) //merges?: changes

By passing a boolean value you can set the `public` status (true -> public, false -> private).
Passing a string or an array of strings you can set the groups and entities to give permission to this post.
To set the post public status and permit some entities access, call the permissions function multiple times.

	 	.permissions(Boolean)
	 	.permissions('https://enti.ty' || ['groupID', 'http://enti.ty'])

### .update
This function creates new versions of posts.
The first argument is required and takes the id of the post to update.
After that you can pass either the version hash of a parent version or a full parent object, consisting of at least a `version` key and optionally `post` and `entity` keys.

	client.update(id[, parentHashString || fullParentObject][, callback])

Parents can be also set in the same form with a dedicated function. Calling this function multiple times, adds the new parents.

		.parents(parentHashString || fullParentObject)

All setters of the `create` function expect `publishedAt` can be used here too.  
Additionally these setters are available.

		.versionPublishedAt(Number)
		.versionMessage(String)

### .delete
This function can be used to delete specific posts. The `id` parameter is required.

	client.delete(id[, callback])
		.version(String) // only delete a specific version
		.createDeletePost(Boolean)

### todo
- implement getting and posting attachments

## license
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
