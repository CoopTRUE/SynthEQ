import { toast } from '@zerodevx/svelte-toast'

const push = (message: string, toastClass: string) => {
  toast.push(message, { classes: [toastClass], dismissable: false })
}
function success(message: string) {
  push(message, 'success')
}
function error(message: string) {
  push(message, 'error')
}
function warn(message: string) {
  push(message, 'warning')
}
class LongToast {
  id: number
  currentPos: number
  constructor(msg: string) {
    this.currentPos = 0
    this.id = toast.push(msg, {
      initial: 0,
      next: 0,
      dismissable: false
    })
  }
  newMsg(msg: string, relativeCompletion: number, error: boolean = false) {
    const next = relativeCompletion * (1 - this.currentPos) + this.currentPos
    console.log(next)
    toast.set(this.id, {
      msg,
      next,
      classes: next === 1 ? (error ? ['error'] : ['success']) : []
    })
  }
}

export default {
  success,
  error,
  warn,
  LongToast
}
