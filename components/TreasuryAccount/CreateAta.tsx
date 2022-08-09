import Input from '@components/inputs/Input'
import { useEffect, useState } from 'react'
import tokenService from '@utils/services/token'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { TokenProgramAccount, tryGetMint } from '@utils/tokens'
import useWalletStore from 'stores/useWalletStore'
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import { debounce } from '@utils/debounce'
import Button from '@components/Button'
import { createATA } from '@utils/ataTools'
import { tryGetAta } from '@utils/validations'
import { sendTransaction } from '@utils/send'
import useRealm from '@hooks/useRealm'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import * as serum from '@project-serum/common'
import { InformationCircleIcon } from '@heroicons/react/outline'
import TokenMintInput from '@components/inputs/TokenMintInput'
import { TokenInfo } from '@solana/spl-token-registry'

const CreateAta = ({
  owner,
  governancePk,
  createCallback,
}: {
  owner: PublicKey
  governancePk: PublicKey
  createCallback: () => void
}) => {
  const { realm } = useRealm()
  const refetchGovernanceAccounts = useGovernanceAssetsStore(
    (s) => s.refetchGovernanceAccounts
  )
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const [isLoading, setIsLoading] = useState(false)
  const [validatedTypedMint, setValidatedTypedMint] = useState<
    string | undefined
  >()
  const [foundByNameToken, setFoundByNameToken] = useState<
    TokenInfo | undefined
  >()
  const handleCreate = async () => {
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
        wallet!.publicKey!
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
        wallet: wallet!,
        connection: connection.current!,
        signers,
      })
    }
    await refetchGovernanceAccounts(connection, realm!, governancePk)
    setIsLoading(false)
    createCallback()
  }
  return (
    <div>
      <h3 className="mb-4 flex items-center">Create token account</h3>
      <TokenMintInput
        onValidMintChange={(mintAddress, tokenInfo) => {
          // TODO: Set the validated typedMint
          setValidatedTypedMint(mintAddress)
          // TODO: set the foundByNameToken
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
