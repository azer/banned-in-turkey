var http = require('http')
var memoize = require('memoize-with-leveldb')('./db')
var debug = require('debug')('banned?')
var exec = require('child_process').exec
var url = require('url')
var fs = require('fs')
var concat = require('concat-stream')

var browserify = require('browserify')()
browserify.add('./app.js')

var blacklist = [
  '195.175.39.39',
  '195.175.254.2'
]

var memoized = memoize(query, '1 day')

var api = require('circle')({
  '/:uri': check
})

http.createServer(route).listen(process.env.PORT || 8080, '0.0.0.0');
debug('Server running at %s', process.env.PORT || 8080)

function check (reply, match) {
  var uri = match.params.uri.replace(/^www\./, '')
  memoized(uri, reply)
}

function query (uri, callback) {
  (/\d+\.\d+\.\d+\.\d+/.test(uri) ? ip : domain)(uri, callback)
}

function domain (uri, callback) {
  if (!/^http/.test(uri)) {
     uri = 'http://' + uri
  }

  var hostname = url.parse(uri).hostname
  var lookupErr = new Error('Lookup error')
  lookupErr.status = 200

  var ip
  var result

  debug('Checking if the hostname %s is banned', hostname)

  exec('nslookup ' + hostname, function (error, stdout, stderr) {
    if (error) return callback(error)
    if (!stdout) return callback(lookupErr)

    result = stdout.split('Name:')[1]

    if (!result) return callback(lookupErr)

    result = result.match(/Address:\s*(\d+\.\d+\.\d+\.\d+)/)

    if (!result) return callback(lookupErr)

    ip = result[1];

    debug('%s resolved as %s', hostname, ip)

    callback(undefined, {
      hostname: hostname,
      ip: ip,
      banned: blacklist.indexOf(ip) > -1
    })
  })
}

function ip (uri, callback) {
  debug('Checking if the IP %s is banned', uri)

  exec('ping ' + uri + ' -c 1 -w 1.5', function (error, stdout, stderr) {
    if (!stdout) return callback(new Error('Failed to ping ' + uri))
    callback(undefined, { banned: /0 received,/.test(stdout), ip: uri })
  })
}

function route(req, res) {
  if (req.url.slice(0, 4) == '/api') {
    req.url = req.url.slice(4) || '/'
    return api.route(req, res)
  }

  if (req.url == '/js') return js(req, res)
  if (req.url == '/css') return asset('style.css', req, res)
  if (req.url == 'robots.txt' || req.url == '/favicon.ico') return res.end('')

  asset('index.html', req, res)
}

function js (req, res) {
  if (!process.env.NOCACHE && js.cache) return res.end(js.cache)
  debug('Browserifying app.js')
  browserify.bundle().pipe(concat(function (bundle) {
    js.cache = bundle.toString()
    res.end(js.cache)
  }))
}

function asset (path, req, res) {
  asset.cache || (asset.cache = {})

  if (!process.env.NOCACHE && asset.cache[path]) return res.end(asset.cache[path])

  debug('Reading %s', path)

  fs.readFile('./' + path, function (error, content) {
    if (error) return res.end('Try again')
    res.end(asset.cache[path] = content.toString())
  })
}
