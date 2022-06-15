import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {sendTransaction} from '@utils/send'
import useSwitchboardPluginStore from 'SwitchboardVotePlugin/store/switchboardStore'
import useWalletStore from 'stores/useWalletStore'

export const sbRefreshWeight = async (
  voterWeightInstructions,
  connection,
  wallet
): Promise<PublicKey> => {

  /*const voterWeightInstructions = useSwitchboardPluginStore((s) => s.state.instructions);
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)*/

  let transaction = new Transaction().add(
    voterWeightInstructions
  );

  await sendTransaction({
    transaction: transaction,
    wallet: wallet,
    signers: [],
    connection: connection.current,
  });

}
