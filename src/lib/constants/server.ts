export const address = '0xEC242C29E54Bc34F71258f85544500aeF0834a75'
export const signatureMsg = `Signing this message confirms you are the owner of this address. This will cost no gas.`

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
