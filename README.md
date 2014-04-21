# tent-request
A javascript module for talking to [Tent](https://tent.io) servers. It supports the current version 0.3.
Thanks to [browserify](https://github.com/substack/node-browserify) this module can also be used in the browser.

## install
With npm:
	
	npm install tent-request --save

# usage
```javascript
var request = require('tent-request')
var client = request(meta, auth)
```

Create a new client for each user with a meta post and auth credentials. The second parameter is optional.  
This library has no support for retrieving meta posts. You could use [tent-discover](https://github.com/hendrikcech/tent-discover) for this (hint hint).  
`auth` has to be an object with keys named `id` OR `access_token`, `key` OR `hawk_key` and `algorithm` OR `hawk_algorithm`. You could use [tent-auth](https://github.com/hendrikcech/tent-auth) to get the credentials.

## methods
`client` exposes several functions to interact with the users' Tent server.
If you have questions regarding the specific behaviour of some of those methods, don't be afraid to look in the source, it's pretty basic.

### result (callback)
All functions optionally take a callback as the last argument, which gets called after the full response is received.  
The `err` variable is null, unless `http.request()` emits an error or the response status code is not 200.  
The `response` object is forwarded from the underlying `response` event emitted by [`http.ClientRequest`](http://nodejs.org/api/http.html#http_class_http_clientrequest). It's an instance of [http.IncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage). It has information about the response, such as the response status code and headers.  
`body` either contains the JSON decoded response or a number, if the count of a post list was requested.

```javascript
function callback(err, response, body) {
	if(err) return console.error(err)
	console.log('response with ' + response.statusCode)
	console.log(body)
}
```

Regardless of the callback, all functions return a [http.ClientRequest](http://nodejs.org/api/http.html#http_class_http_clientrequest) object. You can listen for the `response` event to catch the data.
This will likely change in future versions.

```javascript
().on('response', function(response) {
	response.pipe(process.stdout)
})
```

### .create

	client.create(type[, metadata][, content][, cb])

Use this function to create a new post. All paramaters except the type are optional. Information about the post schema can be found [in the official docs](https://tent.io/docs/posts#post-schema).

#### metadata
The metadata object can contain `publishedAt`, `licenses`, `permissions`, `mentions` and `attachments` keys.

```javascript
client.create('https://tent.io/types/status/v0', metadata)
```

**publishedAt**
```javascript
{ publishedAt: 1390986459798 }
```
Manually set when the post was published. Timestamp in milliseconds.

**licenses**
```javascript
{ licenses: 'http://creativecommons.org/licenses/by/4.0/' }
{ licenses: ['http://do.whatever', 'https://you.want'] }
```
Define the license(s) under which you want to publish the post. You can pass multiple licenses as an array of strings.

**permissions**
```javascript
{ permissions: false }
{ permissions: 'https://entity.cupcake.is' }
{ permissions: ['https://entity.cupcake.is', 'group id' }
```
You can specify to only allow certain entities and groups to see your Tent posts.  
Control if the post is public by using a boolean value: `true` -> public, `false` -> privat.  
By passing one string or multiple strings inside an array, you can set the groups and entities to give read permission for this post.

**mentions**
```javascript
{ mentions: 'https://entity.cupcake.is' } // either mention a entity,
{ mentions: 'postID') } // a post
{ mentions: 'http://enti.ty postID' } // or a post by another entity
{ mentions: ['http://enti.ty', 'postId', 'https://enti.ty postId']
```
Populate the mentions array of the post. Mentions will be completely replaced with Tent 0.4.

```javascript
{ mentions: {
	entity: 'http://entity.net',
	post: 'postID',
	version: 'versionHash'
	type: 'type',
	public: true
}}
```

If you need to set the version, type or public status, pass a object containing one or more of those keys. Multiple mentions can be made by passing an array of those.

**attachments**
```javascript
{ attachments: {
	name: 'photo.jpg',
	type: 'image/jpeg',
	category: 'photo[0]',
	size: 33920,
	data: photoStream
}}
```

Posts can have [attachments](https://tent.io/docs/posts#attachments). Attachments are just binary data stored alongside a post.  
To add an attachment to a post, pass one or more (inside an array) attachment objects to the create function like shown above.  
`data` can either be a string, a buffer or a stream. If `data` is a stream, you have to provide the attachment size (will be used for the Content-Length header).  
The `name`, `type` and `category` fields are required.

### .get

	client.get(id[, entity][, opts][, callback])

Use this function to interact with a specific post from the [`post` server endpoint](https://tent.io/docs/api#post).  
`get()` requires the `id` of the post to fetch. If no entity is passed as the second parameter, the function will try to get a post with the given id from the current entity.

**Opts Object**

key | description | example
--- | --- | ---
version | Set to interact with a specific version. By default the latest version will be picked. | `{ version: 'aB8mjnxlIeJ8n2tP5ztp' }`
profiles | Set to one or more of these values to get the relevant profiles: `entity`, `refs`, `mentions`, `permissions`, `parents` or `all`. `all` is an shortcut and replaced by the other values. | `{ profiles: ['entity', 'mentions'] }` `{ profiles: 'all' }`

**sub functions**  
These subfunctions take the same arguments as the base function.

function | description
--- | ---
client.get.mentions() | Get all posts that are mentioning the post with the given `id`.
client.get.versions() | Get all versions of the post with the given `id`.
client.get.childVersions() | Get all versions to which the post with the given `id` is the parent.

To get the number of posts matched, use .count().

```javascript
client.get.versions.count('id')
client.get.mentions.count('id')
...
```

### .update

	client.update(id, parent, type[, metadata][, content][, callback])

Use this function to create a new version of an already existing post. Apart from the first two arguments, this function should be familiar to you: It has the same signature as the `create` function and `metadata` and `content` are accepting the same keys.

Pass the id of the post to update as the first argument. A second argument is required, which is a reference to the parent post. You can either pass the version id of a parent version or a full parent object, consisting of at least a `version` key and optionally `post` and `entity` keys. For more information on the update procedure take a look at [this github issue](https://github.com/tent/tent.io/issues/170).

In addition to the already known metadata you can set `versionPublishedAt` and `versionMessage`. `publishedAt` can not be changed.

### .query

	([query][, opts][, callback])

This method communicates with the `posts_feed` server endpoint and can be used to filter posts by certain criteria. More information can be found [here](https://tent.io/docs/api#postsfeed).  
The query endpoint will undergo big changes with Tent 0.4.

**query object**  
The posts feed can be filtered by the following parameters.

key | description | example
--- | --- | ---
limit | Limit the number of posts returned. | `{ limit: 2 }`  
sortBy | Specify by which field the posts should be sorted. Possible values are `received_at`, `published_at`, `version.received_at` and `version.published_at`. | `{ sortBy: 'received_at' }`
since | Return only posts since this point. Time in milliseconds since the Unix epoch. | `{ since: 1373643809000 }`
until | Return only posts until this point. Time in milliseconds since the Unix epoch. | `{ until: 1373643814000 }`
before | Return only posts before this point. Time in milliseconds since the Unix epoch. | `{ before: 1373643909000 }`
types | Specify the types of the returned posts. | `{ types: 'http://ty.pe' }` `{ types: ['http://ty.pe', 'https://another.type'] }`
entities | Filter by the publishing entity. | `{ entities: 'http://one.entity' }` `{ entities: ['https://or.more', 'http://than.one'] }`
mentions | Query by mentions. Supports AND and OR operators. Entities in one array are connected by AND operators, commata represent ORs. | `{ mentions: [['http://enti.ty' + '+id',/*AND*/ 'https://enti.ty'], /*OR*/ 'http://pet.er'] }`

**Opts Object**

key | description | example
--- | --- | ---
profiles | Set to one or more of these values to get the relevant profiles: `entity`, `refs`, `mentions`, `permissions`, `parents` or `all`. `all` is an shortcut and replaced by the other values. | `{ profiles: ['entity', 'mentions'] }` `{ profiles: 'all' }`
maxRefs | Set the maximum number of included refs. | `{ maxRefs: 5 }`

**Count**  
To get the number of posts matched, call the subfunction `count`. Be aware that the actual posts won't be returned.

	.count([query][, opts][, callback])

### .delete
This simple function can be used to delete specific posts. The `id` parameter is required.

	client.delete(id[, opts][, callback])

**opts object**

key | description | example
--- | --- | ---
version | Only delete a specific version. | `{ version: 'versionId' }`
createDeletePost | Control if a [delete post](https://tent.io/docs/post-types#delete) should be created. Server default: true. | `{ createDeletePost: false }`

### .batch
The Tent protocol supports batch requests. This enables you to perform multiple logical requests in one round-trip. More information can be found in this [Github issue](https://github.com/tent/tent.io/issues/177).  
Note: At the time of writing this, the biggest Tent host  [Cupcake](https://cupcake.io) does not support batch requests.

```javascript
var batch = client.batch()

batch.get(id, function(err, res, body) {})
batch.delete(id)
batch.query(query, cb)

batch.end(function(err, res, body) {})
```

The batch object exposes the same functions as the main client object. Individual callbacks are invoked as usual.  
Send the batch request off by calling the `end` method. The error and response objects contain information concerning the batch request itself. They are not about the individual requests.  
`body` is an array containing objects with error, res and body keys. The array is sorted by the order in which the requests were added to the batch object. The response to the delete request in the example above can therefore be found in `body[1]`.

### pagination
All post lists support pagination. This includes the results of the `query`, `get.mentions`, `get.versions` and `get.childVersions` functions. The methods to retrieve other pages are bound to the context of the callback.
There are `this.next`, `this.prev`, `this.first` and `this.last` functions, if the corresponding pages are available.

	(cb)

	function cb(err, res, body) {
		console.log(body)
		if(this.next) this.next(cb)
	}

This code snippet would log all posts that are saved on a Tent server.

# test
Duplicate `tests/config.template.js`, rename the file to `config.js` and populate it. The app must be authorized to read and write the type defined in the config file and `https://tent.io/types/delete/v0#`.  
Then do

	npm test

to run the tests.

# license
The MIT License (MIT)

Copyright (c) 2014 Hendrik Cech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.