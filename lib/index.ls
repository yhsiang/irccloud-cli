require! <[fs request cologger moment]>
log = cologger
WebSocket = require 'ws'

path =
  token: '/chat/auth-formtoken'
  login: '/chat/login'
  stream: '/chat/stream'

get-session-key = (options, next) ->
  {server, user, verbose} = options
  (err, res, body) <- request.post do
    url: 'https://' + server + path.token
  return log.error err if err
  {success, token} = JSON.parse body
  if success
    log.success 'Successfully obtained authentication token'
  else if verbose
    log.error body
  user <<< token: token
  (err, res, body) <- request.post do
    url: 'https://' + server + path.login
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

connect-websocket = (server, session, next) ->

  ws = new WebSocket 'wss://' + server + '/', do
    origin: 'https://' + server
    headers:
      'Cookie': 'session=' + session

  ws.on 'message' ->
    res = JSON.parse it
    if res.url isnt '' and res.type is 'oob_include'
      request.get do
        url: 'https://' + server + res.url
        headers:
          'Cookie': 'session=' + session
          'Accept-Encoding': 'gzip'
    next res

show-buffer = (options, msg) ->
  return if '' isnt options.channel and msg.chan isnt options.channel
  if options.log-path
    save-log options.log-path, msg
  else
    log.success ' [' + msg.chan + '] <' + msg.from + '> ' + msg.msg

save-log = (log-path, msg-buffer) ->
  now = moment!
  { chan, from, msg } = msg-buffer
  filename = "#{chan}" + now.format '.YYYY-MM'
  full-path = log-path + "/#{filename}"
  message = now.format('HH:mm') + " #{from}> #{msg}\n"
  if fs.existsSync full-path
    fs.appendFileSync full-path, message, 'utf-8'
  else
    log.success "Start to save logs in #{full-path}"
    fs.writeFileSync full-path, message, 'utf-8'

export connect = (options) ->
  session <- get-session-key do
    server: options.server
    user:
      email: options.email
      password: options.password
    verbose: options.verbose
  res <- connect-websocket options.server, session
  log.info 'Waiting for message ...' if res.bid < 0
  switch res.type
  | 'buffer_msg' => show-buffer options, res
  | otherwise => ''
