import Input from './Input'
import { inputClasses } from './styles'
import { useEffect, useState } from 'react'
import tokenPriceService, {
  TokenInfoWithoutDecimals,
} from '@utils/services/tokenPrice'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { TokenProgramAccount, tryGetMint } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import { debounce } from '@utils/debounce'
import { InformationCircleIcon } from '@heroicons/react/outline'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const TokenMintInput = ({
  noMaxWidth = true,
  disabled = false,
  error = '',
  label = 'Token',
  onValidMintChange,
}: {
  disabled?: boolean
  error?: string
  noMaxWidth?: boolean
  label?: string
  onValidMintChange: (
    mintAddress: string | undefined,
    foundByNameToken: TokenInfoWithoutDecimals | undefined
  ) => void
}) => {
  const connection = useLegacyConnectionContext()
  const [isTyping, setIsTyping] = useState(false)
  const [query, setQuery] = useState<string>('')
  const [mintInfo, setMintInfo] = useState<
    TokenProgramAccount<MintInfo> | undefined
  >(undefined)
  const tokenList = tokenPriceService._tokenList
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
      if (info) {
        onValidMintChange(typedMint, foundByNameToken)
      } else {
        onValidMintChange(undefined, undefined)
      }
    }
    if (typedMint) {
      validateMint()
    } else if (foundByNameToken) {
      onValidMintChange(undefined, foundByNameToken)
    } else {
      setMintInfo(undefined)
      onValidMintChange(undefined, undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [typedMint, foundByNameToken])
  useEffect(() => {
    if (isTyping !== !!query) {
      setIsTyping(!!query)
    }
    debounce.debounceFcn(async () => {
      setIsTyping(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [query])
  return (
    <>
      <div>
        <Input
          noMaxWidth={noMaxWidth}
          className="mb-2"
          label={label}
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
            //   "flex items-center text-fgd-1 border border-fgd-4 p-3 rounded-lg max-w-lg"
            className={inputClasses({
              noMaxWidth,
              className:
                'flex items-center text-fgd-1 border border-fgd-4 p-3 rounded-lg',
              disabled,
              error,
            })}
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
              <div>
                <span className="text-primary-light text-sm flex items-center">
                  <InformationCircleIcon className="w-5 mr-1"></InformationCircleIcon>{' '}
                  Type exact mint address, token name or symbol
                </span>
              </div>
            )}
          </div>
        </div>
      </>
    </>
  )
}
export default TokenMintInput
