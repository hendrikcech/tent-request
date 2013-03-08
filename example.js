var tent = require('./post')

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

//tent('get', 'https://hendrik.tent.is/tent/followings', {'limit':2}, function(err, followings) {
tent('post', 'https://hendrik.tent.is/tent/apps', app, function(err, followings) {
	if(err) return console.log(err)
	console.log(followings)
})