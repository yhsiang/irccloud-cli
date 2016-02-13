import test from 'tape'
import nock from 'nock'
import {Server} from 'ws'
import 'babel-polyfill'
import * as irccloud from '../src/lib'

const wss = new Server({port: 8080});
wss.on('connection', (socket) => {
  socket.send(JSON.stringify({type: 'header', streamid: 'sacasc'}))
  socket.send(JSON.stringify({type: 'oob_include', url: '/chat/backlog/123'}))
  wss.close()
})

nock('https://www.irccloud.com')
  .post('/chat/auth-formtoken')
  .reply(200, {
    _reqid: 0,
    success: true,
    token: 'token' })
  .post('/chat/login')
  .reply(200, {
    _reqid: 0,
    success: true,
    session: 'session',
    websocket_host: 'localhost',
    websocket_port: 8080, })
  .post('/chat/backlog')
  .reply(200)

test('getToken test', async (t) => {
  t.plan(1)
  let {token} = JSON.parse(await irccloud.getToken())
  t.equal(token, 'token')
})

test('login test', async (t) => {
  t.plan(1)
  let {session} = JSON.parse(await irccloud.login({
    token: 'token',
    email: 'EMAIL',
    password: 'PASSWORD',
  }))
  t.equal(session, 'session')
})

test('WebSocket test', (t) => {
  t.plan(1)
  t.doesNotThrow(() => {
    irccloud.createWebSocket({
      websocket_host: 'localhost',
      session: 'session',
      websocket_port: 8080,
    })
  })
})
