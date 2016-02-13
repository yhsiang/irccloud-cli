import request from 'request-promise'
import WebSocket from 'ws'
import log from 'cologger'

export async function getToken() {
  let res = JSON.parse(await request({
      method: 'POST',
      url: `https://www.irccloud.com/chat/auth-formtoken`,
  }))
  if (!res.success) throw(res)
  return res.token
}

export async function login({token, user}) {
  let res = JSON.parse(await request({
    method: 'POST',
    form: Object.assign({token}, user),
    url: `https://www.irccloud.com/chat/login`,
    headers: {
      'x-auth-formtoken':token
    },
  }))
  if (!res.success) throw(res)
  return res
}

export function backlog({url, streamid, session}) {
  return request({
    url: `https://www.irccloud.com${url}?streamid=${streamid}`,
    headers: {
      'Cookie': `session=${session}`,
      'Accept-Encoding': 'gzip'
    }
  })
}

export function createWebSocket({ websocket_host, session, websocket_port}) {
  let streamid, url = `wss://${websocket_host}/`
  if (websocket_port) url = `ws://${websocket_host}:${websocket_port}/`
  const ws = new WebSocket(url, {
    origin: `https://${websocket_host}`,
    headers: {
      'Cookie': `session=${session}`,
    }
  })
  ws.on('message', (message) => {
    const ws_res = JSON.parse(message)
    if (ws_res.type === 'header') {
      streamid = ws_res.streamid
    }
    if (ws_res.type === 'oob_include') {
      backlog({
        streamid, session,
        url: ws_res.url,
      })
    }
    if (ws_res.type === 'buffer_msg') {
      log.info(`[${ws_res.chan}] <${ws_res.from}> ${ws_res.msg}`)
    }
    if (ws_res.type === 'close') {
      ws.send('close')
    }
  })
  return ws
}

export async function connect(user){
  // get auth token
  let token = await getToken()
  log.success('Successfully obtained authentication token!')
  // handle login
  let res = await login({ token, user })
  log.success(`Successfully logged in as ${user.email}!`)
  // handle WebSocket
  return createWebSocket(res)
}
