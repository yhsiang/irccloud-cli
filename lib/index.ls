require! <[request]>
WebSocket = require 'ws'

base-url = 'https://www.irccloud.com'

path =
  token: '/chat/auth-formtoken'
  login: '/chat/login'
  stream: '/chat/stream'



get-session-key = (user, next) ->
  (err, res, body) <- request.post do
    url: base-url + path.token
  console.log 'Successfully obtained authentication token' if not err

  user.token = JSON.parse body .token
  (err, res, body) <- request.post do
    url: base-url + path.login
    form: user
    headers:
        'x-auth-formtoken': user.token
  console.log 'Successfully logged in as ' + user.email if not err
  { session } = JSON.parse body
  next session


connect-websocket = (session, next) ->

  ws = new WebSocket 'wss://www.irccloud.com/', do
    origin: 'https://www.irccloud.com'
    headers:
      'Cookie': 'session=' + session

  ws.on 'message' ->
    res = JSON.parse it
    if res.url isnt '' and res.type is 'oob_include'
      request.get do
        url: base-url + res.url
        headers:
          'Cookie': 'session=' + session
          'Accept-Encoding': 'gzip'
    next res

show-buffer = (options, msg) ->
  return if '' isnt options.channel and msg.chan isnt options.channel
  console.log ' [' + msg.chan + '] <' + msg.from + '> ' + msg.msg

export connect = (options) ->
  session <- get-session-key do
    email: options.email
    password: options.password
  res <- connect-websocket session

  switch res.type
  | 'buffer_msg' => show-buffer options, res
  | otherwise => ''


