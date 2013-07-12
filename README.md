# github-commit-stream #

A streaming interface to pull in a list of commits from a GitHub repository.

If you're looking for something less specific, [github](http://ghub.io/github)
on NPM covers a lot more ground with the GitHub API - but I was running into
a lot of issues with paginating commits so I whipped this up to solve the
problem quickly.

## Installation ##

``` bash
npm install github-commit-stream
```

## Usage ##

### `exports.createStream(options)` ###

Returns a readable stream that emits commit objects directly from the API.

Takes the following options:

* `user`: The owner of the repository.
* `repo`: The repository name.
* `token`: Your GitHub API token. Optional.
* `per_page`: The amount of commits to retrieve per request. Defaults to 30.
* `since`: Filter to commits since this date.
* `until`: Filter to commits until this date.
* `sha`: SHA or branch to start listing commits from.
* `author`: filter by commit author's login, name or email.

``` javascript
var commitStream = require('github-commit-stream')

commitStream({
    token: process.env.GITHUB_TOKEN
  , user: 'substack'
  , repo: 'node-browserify'
}).on('data', function(d) {
  console.log(d.commit.message)
})
```
