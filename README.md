# tent-request
A node.js module to perform requests against a [Tent](https://tent.io) server.

## install
With npm:
```
npm install tent-request
```

## example
```
var request = require('tent-request')

request({
	method: 'get',
	url: 'https://example.com/followings',
	param: {
		limit: 10
	}
}, function(err, response, followings) {
    	if(err) return console.log(err)
    	if(res.statusCode < 200 || res.statusCode >= 300) return console.log(res.statusCode)
    	console.log('Such a nice guy: ' + followings[5].entity)
})
```

## methods

```
var request = require('tent-request')
```

### request(options, callback)
`options` (object):

 Key | Type |Required | Description
 --- | --- | --- | --- 
method | string | optional | HTTP request method (GET, POST, PUT, DELETE, HEAD), defaults to GET
url | string | required | full URL to request
param | object | optional | parameters / content to pass along with the request
auth | object | optional | need to contain `mac_key` and `mac_key_id`/`access_token` to perform an authenticated request

`callback` (function):

Value | Description
--- | ---
error | error object if an error occured, `null` if not
response | untouched response object from the core http module ([more information](http://nodejs.org/api/http.html#http_http_incomingmessage))
body | response body. object if server sent json, the raw body if not

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
