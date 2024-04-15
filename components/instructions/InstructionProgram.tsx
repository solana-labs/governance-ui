import { ConnectionContext } from '@utils/connection'
import { getProgramName, isNativeSolanaProgram } from './programs/names'
import { getExplorerUrl } from '@components/explorer/tools'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { BPF_UPGRADE_LOADER_ID } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import { useState, useEffect } from 'react'
import { fetchParsedAccountInfoByPubkey } from '@hooks/queries/parsedAccountInfo'

const InstructionProgram = ({
  connection,
  programId,
}: {
  connection: ConnectionContext
  programId: PublicKey
}) => {
  const isNativeSolProgram = isNativeSolanaProgram(programId)
  const [isUpgradeable, setIsUpgradeable] = useState(false)
  const [authority, setAuthority] = useState('')

  const programLabel = getProgramName(programId)
  useEffect(() => {
    const tryGetProgramInfo = async (programId: PublicKey) => {
      try {
        const programAccount = (
          await fetchParsedAccountInfoByPubkey(connection.current, programId)
        ).result

        const programInfo = (
          await fetchParsedAccountInfoByPubkey(
            connection.current,
            new PublicKey(programAccount?.data['parsed']?.info?.programData)
          )
        ).result
        const info = programInfo?.data['parsed']?.info
        const authority = info.authority
        const isUpgradeable =
          programInfo?.owner?.equals(BPF_UPGRADE_LOADER_ID) && authority

        setIsUpgradeable(isUpgradeable)
        setAuthority(authority)
        // eslint-disable-next-line no-empty
      } catch {}
    }

    if (connection.cluster === 'mainnet' && !isNativeSolProgram) {
      tryGetProgramInfo(programId)
    }
  }, [programId, connection, isNativeSolProgram])

  return (
    <div className="border-t border-bkg-4 flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
      <span className="font-bold text-fgd-1 text-sm">
        <div>Program</div>
        {authority && (
          <a
            href={`https://explorer.solana.com/address/${authority}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="text-[10px] text-link">
              Authority: {abbreviateAddress(authority)}
            </div>
            <div className="text-[10px]">
              Upgradeable: {isUpgradeable ? 'Yes' : 'No'}
            </div>
          </a>
        )}
      </span>
      <div className="flex items-center pt-1 lg:pt-0">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none flex items-center"
          href={getExplorerUrl(connection.endpoint, programId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            {programId.toBase58()}
            {programLabel && (
              <div className="mt-1 text-fgd-3 lg:text-right text-xs">
                {programLabel}
              </div>
            )}
            <div></div>
          </div>
          <ExternalLinkIcon
            className={`flex-shrink-0 h-4 w-4 ml-2 text-primary-light`}
          />
        </a>
      </div>
    </div>
  )
}

export default InstructionProgram
