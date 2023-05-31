import { AccountMetaData } from '@solana/spl-governance'
import { InstructionDescriptor, getAccountName } from './tools'
import { getExplorerUrl } from '@components/explorer/tools'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { useState, useRef, useEffect } from 'react'
import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export default function InstructionAccount({
  endpoint,
  index,
  accountMeta,
  descriptor,
}: {
  endpoint: string
  index: number
  accountMeta: AccountMetaData
  descriptor: InstructionDescriptor | undefined
}) {
  const connection = useLegacyConnectionContext()
  const [accountLabel, setAccountLabel] = useState(
    getAccountName(accountMeta.pubkey)
  )
  const isFetching = useRef(false)

  useEffect(() => {
    if (!accountLabel && !isFetching.current) {
      isFetching.current = true
      // Check if the account is SPL token account and if yes then display its owner
      fetchTokenAccountByPubkey(connection.current, accountMeta.pubkey).then(
        (ta) => {
          if (ta.result) {
            setAccountLabel(`owner: ${ta.result?.owner.toBase58()}`)
          }
          isFetching.current = false
        }
      )
      // TODO: Extend to other well known account types
    }
  }, [accountLabel, accountMeta.pubkey, connection])

  return (
    <div className="border-t border-bkg-4 flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
      <div className="pb-1 lg:pb-0">
        <p className="font-bold text-fgd-1">{`Account ${index + 1}`}</p>
        {descriptor?.accounts && (
          <div className="my-0.5 text-fgd-3 text-xs">
            {descriptor.accounts[index]?.name}
          </div>
        )}
        <div className="text-[10px] flex space-x-3">
          {accountMeta.isSigner && (
            <div className="text-primary-light">Signer</div>
          )}{' '}
          {accountMeta.isWritable && (
            <div className="text-[#b45be1]">Writable</div>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none flex items-center"
          href={getExplorerUrl(endpoint, accountMeta.pubkey)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            <div>{accountMeta.pubkey.toBase58()}</div>
            <div></div>
            {accountLabel && (
              <div className="mt-0.5 text-fgd-3 text-right text-xs">
                {accountLabel}
              </div>
            )}
          </div>
          <ExternalLinkIcon
            className={`flex-shrink-0 h-4 w-4 ml-2 text-primary-light`}
          />
        </a>
      </div>
    </div>
  )
}
