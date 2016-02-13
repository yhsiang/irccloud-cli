import request from 'request-promise'
import log from 'cologger'
import WebSocket from 'ws'

export function getToken() {
  return request({
      method: 'POST',
      url: `https://www.irccloud.com/chat/auth-formtoken`,
  });
}

export function login({token, user}) {
  return request({
    method: 'POST',
    form: Object.assign({token}, user),
    url: `https://www.irccloud.com/chat/login`,
    headers: {
      'x-auth-formtoken':token
    },
  })
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
  if (websocket_port !== 443) url = `ws://${websocket_host}:${websocket_port}/`
  const ws = new WebSocket(url, {
    origin: `https://${websocket_host}`,
    headers: {
      'Cookie': `session=${session}`,
    }
  })
  ws.on('message', async (it) => {
    const ws_res = JSON.parse(it)
    switch(ws_res.type) {
      case 'header':
        streamid = ws_res.streamid
        break
      case 'oob_include':
        let res = JSON.parse(await backlog({
          streamid, session,
          url: ws_res.url,
        }))
        break
      case 'buffer_msg':
        log.success(`[${ws_res.chan}] <${ws_res.from}> ${ws_res.msg}`)
        break
      default:
    }
  })
  return ws
}

export async function connect(user) {
  try {
    // get auth token
    let res = JSON.parse(await getToken())
    if (!res.success) log.error(res.message)
    log.success('Successfully obtained authentication token')
    // handle login
    res = JSON.parse(await login({
      token: res.token,
      user
    }))
    if (!res.success) log.error(res.message)
    log.success(`Successfully logged in as ${user.email}`)
    // handle WebSocket
    createWebSocket(Object.assign({ websocket_port: 443 }, res))
  } catch (err) {
    log.error(err.message)
  }
}
