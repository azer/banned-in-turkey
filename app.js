var dom = require('domquery')
var page = require('page')
var textbox = dom('input')
var title = dom('h1 span')
var jsonp = require('jsonp')

page('/test/:uri', function (ctx) {
  textbox.val(ctx.params.uri)
  query(ctx.params.uri)
})

page()

textbox.on('> enter', function () {
  if (!textbox.val().trim()) return;
  page('/test/' + textbox.val().trim())
})

textbox.val('')
textbox[0].focus()

function query (uri) {
  title.html('Checking...')
  jsonp('/api/' + uri, function (error, res) {
    if (error || res.error) {
      title.html(error.message || res.error)
      title[0].className = 'error'
      return
    }

    var msg = '<strong>' + (res.result.hostname || res.result.ip) + '</strong>';
    msg += ' is <strong>' + (res.result.banned ? '' : 'not ') + 'banned</strong> in Turkey';
    title.html(msg)
    title[0].className = res.result.banned ? 'banned' : 'not-banned'
  })
}
