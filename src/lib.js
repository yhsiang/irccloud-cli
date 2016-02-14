import request from 'request-promise'
import WebSocket from 'ws'
import log from 'cologger'

async function getToken(host) {
  let res = JSON.parse(await request({
      method: 'POST',
      url: `${host}/chat/auth-formtoken`,
  }))
  if (!res.success) return Promise.reject(res)
  return res.token
}

async function login({token, config}) {
  let res = JSON.parse(await request({
    method: 'POST',
    form: Object.assign({token}, {
      email: config.email,
      password: config.password,
    }),
    url: `${config.host}/chat/login`,
    headers: {
      'x-auth-formtoken':token
    },
  }))
  if (!res.success) return Promise.reject(res)
  return res
}

function backlog({url, streamid, session, host}) {
  return request({
    url: `${host}${url}?streamid=${streamid}`,
    headers: {
      'Cookie': `session=${session}`,
      'Accept-Encoding': 'gzip'
    }
  })
}

function createWebSocket({ websocket_host, session, websocket_port, host }) {
  let streamid, url = `wss://${websocket_host}/`
  if (websocket_port) url = `ws://${websocket_host}:${websocket_port}/`
  const ws = new WebSocket(url, {
    origin: `https://${websocket_host}`,
    headers: {
      'Cookie': `session=${session}`,
    }
  })
  ws.on('error', (error) => {
    log.error(error.message)
  })
  ws.on('message', message => {
    const ws_res = JSON.parse(message)
    if (ws_res.type === 'header') {
      streamid = ws_res.streamid
    }
    if (ws_res.type === 'oob_include') {
      backlog({
        host,
        streamid, session,
        url: ws_res.url,
      })
    }
    if (ws_res.type === 'buffer_msg') {
      log.info(`[${ws_res.chan}] <${ws_res.from}> ${ws_res.msg}`)
    }
  })
  ws.on('close', () => {
    log.info(`Reconnecting...`)
    return createWebSocket({websocket_host, session, websocket_port, host})
  })
  return ws
}

export async function connect(conf){
  const config = Object.assign({
    host: 'https://www.irccloud.com'
  }, conf)
  // get auth token
  let token = await getToken(config.host)
  log.success('Successfully obtained authentication token!')
  // handle login
  let res = await login({ token, config })
  log.success(`Successfully logged in as ${config.email}!`)
  // handle WebSocket
  return createWebSocket(Object.assign({host: config.host}, res))
}
