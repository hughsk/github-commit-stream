var parseLink = require('parse-link-header')
  , through = require('through')
  , request = require('request')
  , async = require('async')
  , url = require('url')

module.exports = createStream

function createStream(opts) {
  opts = opts || {}
  opts.host = opts.host || 'api.github.com'
  opts.pathPrefix = opts.pathPrefix || ''
  if (!opts.user) throw new Error('"user" must be supplied')
  if (!opts.repo) throw new Error('"repo" must be supplied')

  // I'd like to switch this over to es.readable
  // or the streams2 API in the future, but for
  // now this works just fine :)
  var stream = through()

  stream.writable = false
  delete stream.write

  var lastlink = false
    , nextlink = url.format({
        protocol: 'https'
      , hostname: opts.host
      , pathname: opts.pathPrefix + '/repos/' + opts.user + '/' + opts.repo + '/commits'
      , query: options({
          per_page: String(opts.per_page || 30)
        , since: opts.since
        , until: opts.until
        , sha: opts.sha
        , author: opts.author
      })
    })

  async.whilst(function() {
    return !lastlink
  }, function(next) {
    request.get(nextlink, {
      headers: opts.token ? {
        'User-Agent': 'github-commit-stream'
      , 'Authorization': 'token ' + opts.token
      } : {'User-Agent': 'github-commit-stream'}
    }, function(err, res, body) {
      if (err) return next(err)

      try {
        body = JSON.parse(body)
      } catch(e) {
        return next(err)
      }

      var link = parseLink(res.headers.link || '')
      nextlink = link && link.next && link.next.url
      lastlink = !nextlink

      if (body.message) return next(new Error(body.message))

      body.forEach(function(commit) {
        stream.queue(commit)
      })

      next()
    })
  }, function(err) {
    if (err) return stream.emit('error', err)
    stream.queue(null)
  })

  return stream
}

// Returns a copy of "obj" containing
// only the keys with truthy values.
function options(obj) {
  return Object.keys(obj).reduce(function(memo, key) {
    if (obj[key]) memo[key] = obj[key]
    return memo
  }, {})
}
