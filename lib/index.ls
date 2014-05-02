require! <[request cologger]>
log = cologger
WebSocket = require 'ws'

base-url = 'https://www.irccloud.com'

path =
  token: '/chat/auth-formtoken'
  login: '/chat/login'
  stream: '/chat/stream'


get-session-key = (options, next) ->
  {user, verbose} = options
  (err, res, body) <- request.post do
    url: base-url + path.token
  return log.error err if err
  {success, token} = JSON.parse body
  if success
    log.success 'Successfully obtained authentication token'
  else if verbose
    log.error body
  user <<< token: token
  (err, res, body) <- request.post do
    url: base-url + path.login
    form: user
    headers:
        'x-auth-formtoken': user.token
  return log.error err if err
  {success, session} = JSON.parse body
  if success
    log.success 'Successfully logged in as ' + user.email
  else if verbose
    log.error body
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
  log.success ' [' + msg.chan + '] <' + msg.from + '> ' + msg.msg

export connect = (options) ->
  session <- get-session-key do
    user:
      email: options.email
      password: options.password
    verbose: options.verbose
  res <- connect-websocket session
  log.info 'Waiting for message ...' if res.bid < 0
  switch res.type
  | 'buffer_msg' => show-buffer options, res
  | otherwise => ''
