var tent = require('./post')

tent('get', 'https://hendrik.tent.is/tent/followings', {'limit':2}, function(err, followings) {
	if(err) return console.log(err)
	console.log(followings)
})