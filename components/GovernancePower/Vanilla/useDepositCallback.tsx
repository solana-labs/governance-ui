import { useCallback } from 'react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { fetchRealmByPubkey } from '@hooks/queries/realm'
import { useConnection } from '@solana/wallet-adapter-react'
import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'
import { approveTokenTransfer } from '@utils/tokens'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { withDepositGoverningTokens } from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import BN from 'bn.js'
import { sendTransaction } from '@utils/send'
import { fetchProgramVersion } from '@hooks/queries/useProgramVersionQuery'

export const useDepositCallback = (
  role: 'community' | 'council' | 'undefined'
) => {
  const wallet = useWalletOnePointOh()
  const walletPk = wallet?.publicKey ?? undefined
  const realmPk = useSelectedRealmPubkey()
  const { connection } = useConnection()
  return useCallback(
    async (amount: BN) => {
      if (realmPk === undefined || walletPk === undefined) throw new Error()
      const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
      if (realm === undefined) throw new Error()

      const mint =
        role === 'community'
          ? realm.account.communityMint
          : realm.account.config.councilMint
      if (mint === undefined) throw new Error()

      const userAtaPk = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        walletPk, // owner
        true
      )

      const instructions: TransactionInstruction[] = []
      const signers: Keypair[] = []

      let transferAuthority;

      // Checks if the connected wallet is the Squads Multisig extension. This wallet needs custom logic as ephemeral Keypair signatures can not be used after the transaction blockhash has expired.
      if (wallet?.name == "SquadsX") {
        transferAuthority = approveTokenTransfer(
          instructions,
          [],
          userAtaPk,
          wallet!.publicKey!,
          amount,
          true,
          // Delegate set to PDA wallet.
          wallet.publicKey!
        )
      } else {
        transferAuthority = approveTokenTransfer(
          instructions,
          [],
          userAtaPk,
          wallet!.publicKey!,
          amount
        )

        signers.push(transferAuthority)
      }

      const programVersion = await fetchProgramVersion(connection, realm.owner)

      // Same custom logic applied to PDA wallet as before.
      if (wallet?.name == "SquadsX") {
        await withDepositGoverningTokens(
          instructions,
          realm.owner,
          programVersion,
          realm.pubkey,
          userAtaPk,
          mint,
          walletPk,
          // PDA wallet public key instead of transferAuthority public key.
          wallet.publicKey!,
          walletPk,
          amount,
        )
      } else {
        await withDepositGoverningTokens(
          instructions,
          realm.owner,
          programVersion,
          realm.pubkey,
          userAtaPk,
          mint,
          walletPk,
          transferAuthority.publicKey,
          walletPk,
          amount,
        )
      }

      const transaction = new Transaction()
      transaction.add(...instructions)

      await sendTransaction({
        connection,
        wallet: wallet!,
        transaction,
        signers,
        sendingMessage: 'Depositing tokens',
        successMessage: 'Tokens have been deposited',
      })
    },
    [connection, realmPk, role, wallet, walletPk]
  )
}
