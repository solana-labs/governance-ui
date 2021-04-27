import Wallet from '@project-serum/sol-wallet-adapter'
import { notify } from '../../utils/notifications'

export function SolletExtensionAdapter(_, network) {
  const sollet = (window as any).sollet
  if (sollet) {
    return new Wallet(sollet, network)
  }

  return {
    on: () => {
      /* do nothing */
    },
    connect: () => {
      notify({
        message: 'Sollet Extension Error',
        description:
          'Please install the Sollet Extension for Chrome and then reload this page.',
      })
    },
  }
}
