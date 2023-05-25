import { useState } from 'react'
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import Button from '@components/Button'
import { createATA } from '@utils/ataTools'
import { tryGetAta } from '@utils/validations'
import { sendTransaction } from '@utils/send'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import * as serum from '@project-serum/common'
import TokenMintInput from '@components/inputs/TokenMintInput'
import { TokenInfoWithoutDecimals } from '@utils/services/tokenPrice'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const CreateAta = ({
  owner,
  governancePk,
  createCallback,
}: {
  owner: PublicKey
  governancePk: PublicKey
  createCallback: () => void
}) => {
  const realm = useRealmQuery().data?.result
  const refetchGovernanceAccounts = useGovernanceAssetsStore(
    (s) => s.refetchGovernanceAccounts
  )
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const [isLoading, setIsLoading] = useState(false)
  const [validatedTypedMint, setValidatedTypedMint] = useState<
    string | undefined
  >()
  const [foundByNameToken, setFoundByNameToken] = useState<
    TokenInfoWithoutDecimals | undefined
  >()
  const handleCreate = async () => {
    if (!realm) throw new Error()
    const mintPk = validatedTypedMint
      ? new PublicKey(validatedTypedMint)
      : new PublicKey(foundByNameToken!.address)
    if (!mintPk) {
      throw 'Invalid mint'
    }
    if (!wallet) {
      throw 'Wallet not connected'
    }
    setIsLoading(true)
    const existingAta = await tryGetAta(connection.current, mintPk, owner)
    if (!existingAta) {
      await createATA(
        connection.current,
        wallet,
        mintPk,
        owner,
        wallet.publicKey!
      )
    } else {
      const instructions: TransactionInstruction[] = []
      const signers: Keypair[] = []
      const tokenAccount = new Keypair()
      const provider = new serum.Provider(
        connection.current,
        wallet as serum.Wallet,
        serum.Provider.defaultOptions()
      )
      instructions.push(
        ...(await serum.createTokenAccountInstrs(
          provider,
          tokenAccount.publicKey,
          mintPk,
          owner
        ))
      )
      signers.push(tokenAccount)
      const transaction = new Transaction()
      transaction.add(...instructions)

      await sendTransaction({
        transaction,
        wallet: wallet,
        connection: connection.current,
        signers,
      })
    }
    await refetchGovernanceAccounts(connection, realm, governancePk)
    setIsLoading(false)
    createCallback()
  }

  return (
    <div>
      <h3 className="mb-4 flex items-center">Create token account</h3>
      <TokenMintInput
        onValidMintChange={(mintAddress, tokenInfo) => {
          // Set the validated typedMint
          setValidatedTypedMint(mintAddress)
          // set the foundByNameToken
          setFoundByNameToken(tokenInfo)
        }}
      />
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          className="ml-auto"
          disabled={isLoading || (!validatedTypedMint && !foundByNameToken)}
          onClick={handleCreate}
          isLoading={isLoading}
        >
          Create
        </Button>
      </div>
    </div>
  )
}
export default CreateAta
