import pc from 'picocolors'
function getTime() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function format(message: string) {
  return `[${getTime()}] ${message}`
}

export function error(error: string) {
  console.error(pc.bgRed(format(error)))
}

export function reqError(warning: string) {
  console.warn(pc.bgYellow(format(warning)))
}

export function reqInfo(info: string) {
  console.info(pc.blue(format(info)))
}

export function createPosition(message: string) {
  console.info(pc.bgGreen(format(message)))
}

export function closePosition(message: string) {
  console.info(pc.bgCyan(format(message)))
}

// export function deposit(message: string) {
//   console.info(pc.bgCyan(format(message)))
// }

// export function withdraw(message: string) {
//   console.info(pc.bgMagenta(format(message)))
// }

// export function play(message: string) {
//   console.info(pc.bgGreen(format(message)))
// }

export function login(message: string) {
  console.info(pc.bgBlue(format(message)))
}
