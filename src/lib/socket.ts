import { get } from 'svelte/store'
import { socket as _socket } from './stores'
import toast from './toast'

const socket = get(_socket)
export function connect() {
  socket.on('connect', () => toast.success('CONNECTED TO REALTIME SOCKETIO'))
}
