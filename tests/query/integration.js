var test = require('tape')
var request = require('../..')
var config = require('../config')

var client = request(config.meta, config.auth)

var startTime 
var ids = []

test('setup', function(t) {
	var num = 4
	t.plan(num)
	for(var i = 0; i < num; i++) {
		client.create(config.type, function(err, res, body) {
			if(err) t.fail(err)
			else t.pass('dummy post created')

			if(!startTime) {
				startTime = body.post.published_at - 100
			}

			ids.push(body.post.id)
		})
	}
})

test('query() .limit', function(t) {
	t.plan(2)
	client.query({ limit: 2 }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.posts.length, 2, 'limit works')
	}
})

test('query() .since', function(t) {
	t.plan(2)
	// try to even out potential time differences
	// (I experienced those with cupcake)
	client.query({ since: startTime }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(body.posts.length, ids.length)
	}
})

test('query() .limit with profiles', function(t) {
	t.plan(2)
	client.query({ limit: 3 }, { profiles: 'all' }, cb)

	function cb(err, res, body) {
		t.error(err)
		t.ok(body.profiles)
	}
})

test('query.count() .since', function(t) {
	t.plan(3)
	client.query.count({ since: startTime }, cb)

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.equal(typeof body, 'number', 'body is a number')
		t.equal(body, ids.length, 'correct count')
	}
})

test('pagination', function(t) {
	t.plan(3 * 3 + 2 + 2 + 1)

	client.query({ limit: 2 }, cb)

	var call = 1
	var firstPost = ''

	function cb(err, res, body) {
		t.error(err, 'no error')
		t.ok(res, 'response object')
		t.equal(body.posts.length, 2, 'two posts returned')
		
		if(call === 1) {
			t.ok(this.next, 'next function exists')
			t.ok(body.posts[0].id, 'post returned')
			
			firstPost = body.posts[0].id
			this.next(cb)
			call++
		} else if(call === 2) {
			t.ok(this.prev, 'prev function exists')
			t.ok(body.posts[0].id, 'post returned')

			this.prev(cb)
			call++
		} else if(call === 3) {
			t.equal(body.posts[0].id, firstPost, 'on first page again')
		}
	}
})

test('teardown', function(t) {
	t.plan(ids.length)
	ids.forEach(function(id) {
		client.delete(id, { createDeletePost: false }, function(err) {
			if(err) t.fail(err)
			else t.pass('dummy post deleted')
		})
	})
})