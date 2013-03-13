# tent-request
A node.js module for performing requests against a [Tent](https://tent.io) server.

## install
With npm:
```
npm install tent-request
```

## example
```
var request = require('tent-request')

request('get', 'https://example.com/followings', null, { limit: 10 }, function(err, followings) {
    if(err) return console.log(err)
    console.log('Such a nice guy:' + followings[5])
})
```

## methods

```
var request = require('tent-request')
```

### request(method, url, authCredentials, parameters, callback)
- `method`: HTTP request method (GET, POST, PUT, DELETE, HEAD)
- `url`: full URL to request
- `authCredentials`: to perform authenticated requests, set this to an object containing `mac_key` and `mac_key_id`. Otherwise just pass `null`
- `parameters`: object, to pass parameters along with the request. No parameters? Pass `null`
- `callback`: function, which will get called with (null, responseBody) if request succeeded, otherwise an error will be passed

## license
MIT