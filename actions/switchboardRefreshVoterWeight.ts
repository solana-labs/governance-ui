import { Transaction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'

export const sbRefreshWeight = async (
  voterWeightInstructions,
  connection,
  wallet
) => {
  /*const voterWeightInstructions = useSwitchboardPluginStore((s) => s.state.instructions);
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletGay()*/

  const transaction = new Transaction().add(voterWeightInstructions)

  await sendTransaction({
    transaction: transaction,
    wallet: wallet,
    signers: [],
    connection: connection.current,
  })
}
