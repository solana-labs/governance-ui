import Input from '@components/inputs/Input'
import { useEffect, useState } from 'react'
import tokenService from '@utils/services/token'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { TokenProgramAccount, tryGetMint } from '@utils/tokens'
import useWalletStore from 'stores/useWalletStore'
import { PublicKey } from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import { debounce } from '@utils/debounce'
import Button from '@components/Button'
import { createATA } from '@utils/ataTools'

const CreateAta = ({ owner }: { owner: PublicKey }) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState<string>('')
  const [mintInfo, setMintInfo] = useState<
    TokenProgramAccount<MintInfo> | undefined
  >(undefined)
  const tokenList = tokenService._tokenList
  const token = tokenList.find(
    (x) =>
      x.address.toLowerCase() === query.toLowerCase() ||
      x.name.toLowerCase() === query.toLowerCase() ||
      x.symbol.toLowerCase() === query.toLowerCase()
  )
  const mint = tryParsePublicKey(query) ? query : ''
  useEffect(() => {
    const validateMint = async () => {
      const info = await tryGetMint(connection.current, new PublicKey(mint))
      setMintInfo(info)
    }
    if (mint) {
      validateMint()
    } else {
      setMintInfo(undefined)
    }
  }, [mint])
  useEffect(() => {
    setIsTyping(!!query)
    debounce.debounceFcn(async () => {
      setIsTyping(false)
    })
  }, [query])
  const handleCreate = async () => {
    setIsLoading(true)
    await createATA(
      connection.current,
      wallet,
      new PublicKey(mint) || new PublicKey(token!.address),
      owner,
      wallet!.publicKey!
    )
    setIsLoading(false)
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

      {!isTyping && query && (
        <>
          <div className="text-xs" style={{ minHeight: '16px' }}>
            <div className="text-green">
              {mint && mintInfo && <div>Token found</div>}
            </div>
            <div className="text-red">
              {!mintInfo && !token && <div>Token not found</div>}
            </div>
          </div>
          {token && (
            <div className="mt-1">
              <div className="flex items-center text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full">
                {token?.logoURI && (
                  <img
                    className={`flex-shrink-0 h-6 w-6 mr-2.5 mt-0.5`}
                    src={token?.logoURI}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null // prevents looping
                      currentTarget.hidden = true
                    }}
                  />
                )}
                <div className="w-full">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-xs text-th-fgd-1">{token?.name}</div>
                  </div>
                  <div className="text-fgd-3 text-xs">{token?.symbol}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          className="ml-auto"
          disabled={isLoading || (!mint && !token)}
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
