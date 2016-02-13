import request from 'request-promise'
import log from 'cologger'
import WebSocket from 'ws'

let streamid, session;
export async function connect(user) {
  try {
    // get auth token
    let body = await request({
      method: 'POST',
      url: `https://www.irccloud.com/chat/auth-formtoken`,
    })
    let res = JSON.parse(body)
    if (!res.success) log.error(res.message)
    log.success('Successfully obtained authentication token')
    // handle login
    const {token} = res
    body = await request({
      method: 'POST',
      form: Object.assign({token}, user),
      url: `https://www.irccloud.com/chat/login`,
      headers: {
        'x-auth-formtoken':token
      },
    })
    res = JSON.parse(body)
    if (!res.success) log.error(res.message)
    log.success(`Successfully logged in as ${user.email}`)
    session = res.session
    // handle WebSocket
    const ws = new WebSocket(`wss://${res.websocket_host}/`, {
      origin: `https://${res.websocket_host}`,
      headers: {
        'Cookie': `session=${session}`,
      }
    })
    ws.on('message', (it) => {
      const ws_res = JSON.parse(it)
      switch(ws_res.type) {
        case 'header':
          streamid = ws_res.streamid
          break
        case 'oob_include':
          let res = request({
            url: `https://www.irccloud.com${ws_res.url}?streamid=${streamid}`,
            headers: {
              'Cookie': `session=${session}`,
              'Accept-Encoding': 'gzip'
            }
          })
          break
        case 'buffer_msg':
          log.success(`[${ws_res.chan}] <${ws_res.from}> ${ws_res.msg}`)
          break
        default:
      }
    })
  } catch (err) {
    log.error(err.error)
  }
}
