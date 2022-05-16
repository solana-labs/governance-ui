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
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState<string>('')
  const [mintInfo, setMintInfo] = useState<
    TokenProgramAccount<MintInfo> | undefined
  >(undefined)
  const tokenList = tokenService._tokenList
  const foundByNameToken = tokenList.find(
    (x) =>
      x.address.toLowerCase() === query.toLowerCase() ||
      x.name.toLowerCase() === query.toLowerCase() ||
      x.symbol.toLowerCase() === query.toLowerCase()
  )
  const typedMint = tryParsePublicKey(query) ? query : ''
  useEffect(() => {
    const validateMint = async () => {
      const info = await tryGetMint(
        connection.current,
        new PublicKey(typedMint)
      )
      setMintInfo(info)
    }
    if (typedMint) {
      validateMint()
    } else {
      setMintInfo(undefined)
    }
  }, [typedMint])
  useEffect(() => {
    if (isTyping !== !!query) {
      setIsTyping(!!query)
    }
    debounce.debounceFcn(async () => {
      setIsTyping(false)
    })
  }, [query])
  const handleCreate = async () => {
    const mintPk = typedMint
      ? new PublicKey(typedMint)
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
      <div>
        <Input
          noMaxWidth={true}
          className="mb-2"
          label="Token"
          placeholder={'Mint, symbol or name'}
          value={query}
          type="text"
          onChange={(evt) => setQuery(evt.target.value)}
        />
      </div>

      <>
        <div className="text-xs" style={{ minHeight: '16px' }}>
          {!isTyping && (
            <>
              <div className="text-green">
                {((typedMint && mintInfo) || foundByNameToken) && (
                  <div>Token found</div>
                )}
              </div>
              <div className="text-red">
                {!mintInfo && !foundByNameToken && query && (
                  <div>Token not found</div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="mt-1">
          <div
            className="flex items-center text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full"
            style={{ minHeight: '60px' }}
          >
            {!isTyping && foundByNameToken ? (
              <>
                {foundByNameToken?.logoURI && (
                  <img
                    className={`flex-shrink-0 h-6 w-6 mr-2.5 mt-0.5`}
                    src={foundByNameToken?.logoURI}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null // prevents looping
                      currentTarget.hidden = true
                    }}
                  />
                )}
                <div className="w-full">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-xs text-th-fgd-1">
                      {foundByNameToken?.name}
                    </div>
                  </div>
                  <div className="text-fgd-3 text-xs">
                    {foundByNameToken?.symbol}
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-primary-light text-sm flex items-center">
                  <InformationCircleIcon className="w-5 mr-1"></InformationCircleIcon>{' '}
                  Type exact mint address, token name or symbol
                </span>
              </>
            )}
          </div>
        </div>
      </>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          className="ml-auto"
          disabled={isLoading || (!typedMint && !foundByNameToken)}
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
