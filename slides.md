## Speaker

* Grégoire Charvet (geekingfrog.com)
  * Full time node.js developper, former FE (ember.js) dev
  * Passionate about the web
  * Working on the web for almost 2 years now



## Practical Promises



## AKA

* Future (c++, scala, java)
* Defer (twisted)




## Native in node!

<div class="fragment">
V0.2.0...
Removed in 0.3
</div>




<img src="./img/sadCat.png">



## Back to the topic
### What is a Promise?

Wikipedia!

> They describe an object that acts as a proxy for a result that is initially unknown, usually because the computation of its value is yet incomplete.



# Three states
<img src='./img/states.png'>

 * Start in the `unresolved` (or `pending`) state.
 * Cannot change state more than once.



# In practice
```javascript
var promise = new Promise(function(
  resolve,
  reject
) {
  // do something
});
```



```javascript
var promise = new Promise(function(
  resolve,
  reject
) {
  if(Math.random() > .5) resolve();
  else reject();
}
```



# The key method: `.then`

```javascript
function worldDomination() {
  return hireHenchmen() // returns a promise
  .then(trainHenchmen) // returns another promise
  .then(makeHenchmemWork)
  .then(profit);
} // returns the final result:
  // profit after world domination
```



```javascript
function giveMeFive() {
  var two = Promise.resolve(2);
  var four = two.then(function(result) {
    return result + result;
  })
  return four.then(function(result) {
    return 1 + result;
  });
}
```



# Mixed values

```javascript
Promise.resolve(5)
.then(function(five) {
  return five+1; // returns a value
})
.then(function(six) {
  return Promise.resolve(six+1); // returns a promise
})
.then(function(seven) { /* ... */ });
```




# Error handling




## With callback

```javascript
doSomethingAsync(function(err, val) {
  if(err) return console.error(err);
  user.setVal(val);
});
```




<pre>
<code class="javascript overflow" style="max-height: initial;">
-> % node boom.js 
/home/greg/meetup/promises/boom.js:8
  user.setVal(val);
  ^
ReferenceError: user is not defined
    at /home/greg/meetup/promises/boom.js:8:3
    at null._onTimeout (/home/greg/meetup/promises/boom.js:3:5)
    at Timer.listOnTimeout (timers.js:133:15)
greg@archGreg [08:55:56] [~/meetup/promises]
-> % CRASH !
</code>
</pre>



<img src='./img/pokemon.jpeg'>




### Pokemon error handling
```javascript
asyncStuff(function(err, val) {
  try {
    //...
  } catch(error) {
    // handle ...
  }
})
```




### With decorators
```javascript
function catchThemAll(fn) { // pokemon!
  return function() {
    try {
      return fn.apply(this, arguments);
    } catch(err) { /* handle */ }
  }
}
asyncStuff(catchThemAll(callback));
```




### In node.js
```javascript
process.on('uncaughtException', function(err) {
  // handle
});
```



### In the browser
Blow the current stack.

<!-- .element: class="fragment" -->
But the rest of the program keeps running as if nothing happend.


### With Promises

* Throwing error put the promise in rejected state
* Skip all further `then` handler
* Until a `catch`
* Throw in the global scope if `.done` is called



```javascript
Promise.resolve()
.then(function() { throw new Error('boom'); })
.then(function() { /* not executed */ })
.then(function() { /* not executed */ })
.catch(function(error) {
  return 'there there'
})
.then(function(stuff) { stuff === 'there there'; });
```



### Advantage: handle error in one place
And maybe even later if you don't feel it now

```javascript
function randomService(id) {
  return db.findById(id)
  .then(checkObjectIsValid)
  .then(getAnotherObject)
  .then(checkRelations);
}
```
No more
```javascript
if(error) return callback(error);
```
**everywhere**



# Watch out



### Non-terminated chain
```javascript
Promise.resolve()
.then(function() { throw new Error('boom'); });
```
<div class="fragment">...</div>
<div class="fragment">...</div>
<div class="fragment">...</div>
<div class="fragment">...</div>
<div class="fragment">nothing???</div>



### Don't forget the `done`
```javascript
Promise.resolve()
.then(function() { throw new Error('boom'); })
.done();
```
<pre class="fragment" style="font-size:.8em">
/home/greg/meetup/promises/node_modules/bluebird/js/main/async.js:93
throw res.e;
         ^
Error: boom
    at /home/greg/meetup/promises/boom.js:4:26
    at tryCatch1 (/home/greg/meetup/promises/node_modules/bluebird/js/main/util.js:43:21)
    at Promise$_callHandler [as _callHandler] (/home/greg/meetup/promises/node_modules/bluebird/js/main/promise.js:627:13)
[...]
</pre>
</div>



### Another trap

<!-- .slide: class="side-by-side-code" -->
<pre><code class="javascript left">//Don't do that
asyncStuff()
.then(function ok(data) {
  // process data
}, function oops(error) {
  // handle error
});
</code></pre>
<pre><code class="javascript right">//This is better
asyncStuff()
.then(function ok(data) {
  // process data
})
.catch(function oops(error) {
  // handle error
});
</code></pre>




# That's all
<h3 class="fragment">for how promises work</h3>




# How to work with promises?




## Implementation

* [Use bluebird](https://github.com/petkaantonov/bluebird/)
  + great api
  + fantastic performances

* Other libs
  + [Q](https://github.com/kriskowal/q)
  + [when](https://github.com/cujojs/when)
  + [kew](https://github.com/Medium/kew)



### Real life example

Using facebook API to post something on user's wall
```javascript
FB.login(function(){
  FB.api(
    '/me/feed',
    'post',
    {message: 'Hello, world!'}
  );
}, {scope: 'publish_actions'});
```

![fbExample](./img/fbExample.png)



### Promisified login

```javascript
FB.login({scope: 'publish_actions'})
.then(function() {
  FB.api(/* ... */);
})
```



### Passing promises around

```javascript
var fbLogin = FB.login({scope: 'publish_actions'});

function postStuff(msg) {
  return fbLogin.then(function() {
    // post stuff on the user's wall
  })
}
```



### Immutability
* Once resolved or rejected: keeps memory of its state.
* Still asynchronous (`process.setImmediate` or a shim)

```javascript
Promise.resolve(5)
.then(function(stuff) { console.log(stuff); });
console.log('done');
```

<pre class="fragment"><code class="javascript">// done</code></pre>
<pre class="fragment"><code class="javascript">// 5</code></pre>



### Promises in the wild

* `jQuery.ajax`, `jQuery.get` return promises

```javascript
$.get('/api/profile/me').then(function(profile) {
  // do stuff
})
```



```json
$.get('/api/user/abc')
{
  "id": "abc",
  "posts": ["123", "456", "789"]
}
```
Goal: get all the posts for the given user:

```javascript
function getUserPosts(userId)
```



<h3>Callback solution</h3>
<div style="font-size:.5em">
<pre>
<code class="javascript">
function getUserPosts(userId, callback) {
  function getPost(postId, callback) {
    $.get('/api/post/'+postId, callback);
  }

  $.get('/api/user/'+userId, function onSuccess(data) {
    var asyncOperations = data.posts.map(function(postId) {
      return function(cb) { getUserPosts(postId, cb); }
    });

    async.parallel(asyncOperations, function(error, posts) {
      if(error) return callback(error);
      else callback(posts);
    })

  }, callback);
}
</code>
</pre>
</div>



### With promises
<pre>
<code class="javascript overflow">
function getUserPosts(userId) {
  return Promise.cast($.get('/api/user/'+userId))
  .then(function(user) {
    return user.posts;
  })
  .map(function(postId) {
    // you can return a promise here too!
    return $.get('/api/post/'+postId);
  }).all();
}
</code>
</pre>



### Preserving order with `each`

```javascript
Promise.resolve([uri1, uri2, uri3])
.each(function(uri) {
  return $.get(uri);
}).all();
```

Equivalent of `async#serie`



### Timeouts
<pre>
<code class="javascript overflow">
function getWithTimeout(uri, time) {
  var jqXhr = $.get(uri);
  return Promise.resolve(jqXhr) // same as Promise.cast
  .timeout(time)
  .catch(TimeoutError, CancellationError, function(e) {
    jqXhr.abort();
    throw e; // don't swallow the error
  })
  .catch(function(err) { // pokemon
    console.error('Got error:', err);
  });
}
</code>
</pre>



### With an event emitter

<pre>
<code class="javascript overflow">
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

// pending connection to the db
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});
</code>
</pre>

<div class="fragment">
Soooooo. All my code is inside the callback?
</div>



### Promisify this

```javascript
function connect() {
  return new Promise(function(resolve, reject) {
    var db = mongoose.connection;
    db.once('error', reject);
    db.once('open', resolve);
  });
}
```



```javascript
var db = connect();
function findAllUsers() {
  return db.then(function() {
    return User.findAll().exec();
  })
}
```
* No concurrency issue: Am I connected yet? Can I use this object yet?



## Debugging



<pre>
<code class="javascript overflow" style="font-size:.8em">
Promise.resolve().then(function outer() {
    return Promise.resolve().then(function inner() {
        return Promise.resolve().then(function evenMoreInner() {
            a.b.c.d()
        }).catch(function catcher(e) {
            console.error(e.stack);
        });
    });
});
</code>
</pre>

<pre>
<code style="font-size:.6em;margin-top:-2em;line-height:1em;overflow:visible">
ReferenceError: a is not defined
    at evenMoreInner ([anonymous]:6:13)
    at tryCatch1 ([anonymous]:41:19)
    at Promise$_resolvePromise [as _resolvePromise] ([anonymous]:1739:13)
    at Promise$_resolveLast [as _resolveLast] ([anonymous]:1520:14)
    at Async$_consumeFunctionBuffer [as _consumeFunctionBuffer] ([anonymous]:560:33)
    at Async$consumeFunctionBuffer ([anonymous]:515:14)
    at MutationObserver.Promise$_Deferred ([anonymous]:433:17)
</code>
</pre>



### Long stack traces
<pre>
<code class="javascript" style="font-size:.7em;line-height:1.1em">
ReferenceError: a is not defined
  at evenMoreInner ([anonymous]:6:13)
From previous event:
  at inner ([anonymous]:5:24)
From previous event:
  at outer ([anonymous]:4:20)
From previous event:
  at [anonymous]:3:9
  at Object.InjectedScript._evaluateOn ([anonymous]:581:39)
  at Object.InjectedScript._evaluateAndWrap ([anonymous]:540:52)
  at Object.InjectedScript.evaluate ([anonymous]:459:21)
</code>
</pre>

### Works in firefox and chrome too \o/
**Be careful to performance cost**



#### Bluebird is great to start with promises

* Automatically warn you when you forget the `done`

```javascript
Promise.resolve().then(function() {
  throw new Error('boom');
});
```

<div class="fragment">
<pre style="font-size: .6em; line-height:.9em; overflow: visible;word-wrap: normal;">
Possibly unhandled Error: boom
    at /home/greg/meetup/promises/boom.js:4:26
    at tryCatch1 (/home/greg/meetup/promises/node_modules/bluebird/js/main/util.js:43:21)
    at Promise$_callHandler [as _callHandler] (/home/greg/meetup/promises/node_modules/bluebird/js/main/promise.js:627:13)
    at Promise$_settlePromiseFromHandler [as _settlePromiseFromHandler] (/home/greg/meetup/promises/node_modules/bluebird/js/main/promise.js:641:18)
    at Promise$_settlePromiseAt [as _settlePromiseAt] (/home/greg/meetup/promises/node_modules/bluebird/js/main/promise.js:800:14)
    at Async$_consumeFunctionBuffer [as _consumeFunctionBuffer] (/home/greg/meetup/promises/node_modules/bluebird/js/main/async.js:75:12)
    at Async$consumeFunctionBuffer (/home/greg/meetup/promises/node_modules/bluebird/js/main/async.js:38:14)
    at process._tickCallback (node.js:339:11)
    at Function.Module.runMain (module.js:492:11)
    at startup (node.js:124:16)
</pre>
</div>



# Start using promises today
### how to deal with legacy code



# Use promises when available
* `jQuery` jqXhr are promises
* `Mongoose` query return a promise when calling `exec`



### Promisifying jquery

<!-- .slide: class="side-by-side-code" -->
<pre><code class="javascript left">$.get(
  url,
  function success(data) {
    // handle success
  }, function error(err) {
    // handle error
  }
);
</code></pre>
<pre><code class="javascript right">$.get(url)
.then(function(data) {
  //process
})
.fail(function(err) {
  // handle
});
</code></pre>



### Get bluebird with jQuery
```javascript
Promise.cast($.get(url))
.then(...)
.catch(...);
```



### Promisifying event based api

Like indexedDB, websocket, most of the DOM api

```javascript
var request = store.put({
  "text": 'some text',
  "timeStamp" : Date.now()
});

request.onsuccess = function(e) { /* do stuff */ };

request.onerror = function(e) { /* handle error */};
```



### Use the this pattern to wrap it inside a promise
```javascript
store.putAsync = function(data) {
  return new Promise(function(resolve, reject) {
    var request = store.put(data);
    request.onsuccess = resolve;
    request.onerror = reject;
  });
}
```



### In node land

If you're using bluebird `Promise.promisifyAll`

```javascript
var fs = Promise.promisifyAll(require('fs'));
var file = fs.openAsync(path, 'r');
file.then(function(fd) { ... });
```

`Promise.nodeify`
```javascript
function doAsyncStuff(callback) {
  return asyncWithPromise()
  .then(moreProcessing)
  .nodeify(callback);
}
```



# With generators



### Coroutine support
```javascript
Promise.coroutine(function* () {
  try {
    let db = yield connect(); // async
    let users = yield db.getUsers(); // async again
    console.log('we got %d users here', users.length);
  } catch(err) {
    console.error('error:', err);
  }
});
```
* Completely async (non blocking)
* But can program like if it were synchronous



# Preparing for ES7



Async function can wait on promises
```javascript
async function getUsers() {
  try {
    let db = await connect(); // async
    let users = await db.getUsers(); // async again
    console.log('we got %d users here', users.length);
  } catch(err) {
    console.error('error:', err);
  }
}
```



# Conclusion



### Avantages of promises
* Easily composable/chainable
* Can be passed around with a unified interface
* Don't have to manually handle the order of async dependencies
* Future proof: coroutine with generators and async functions with await.

### Downsides
* A bit weird at first (very functional way of thinking)
* There is no problem promises can solve that callbacks cannot
* Most libraries uses callbacks
* Not suited for event based api (with multiple events)



# Q&A



#  




# Announcements & Promotion



## Thanks to Mozilla
<img src="./img/mozilla.png">




## Tonight's sponsor:
<img src="./img/digbil.jpg">



# Digbil is hiring!

### Full javascript stack

* Front end: backbone, css3, canvas
* Back end: node.js, mongodb, amazon cloud



# Pxify is hiring!

**[http://pxify.com](http://pxify.com/)**

* Easy-to-use cross-platform design application
  * "Github for designers" - collaboration platform

* Meteor, Node.js, Node-webkit, SVG

* Funded startup: GSFAccelerator (India)
  * Looking for CTO and more developers
