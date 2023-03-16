export const serverAddress = '0x1BB817100c8C752D1d5B6504009Dd2258524B0aA'

/** Returns the ticket deposit fee */
export function addDepositFee(usd: number) {
  return usd * 1.05 + 5
}

/** Returns the amount of tickets without the deposit fee */
export function removeDepositFee(tickets: number) {
  return (tickets - 0.05) / 1.02
}

/** Returns the ticket withdraw fee */
export function addWithdrawFee(tickets: number) {
  return tickets * 0.02 + 0.05
}
