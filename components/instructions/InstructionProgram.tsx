import { ConnectionContext } from '@utils/connection'
import { getProgramName, isNativeSolanaProgram } from './programs/names'
import { getExplorerUrl } from '@components/explorer/tools'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { BPF_UPGRADE_LOADER_ID } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import axios from 'axios'
import { useState, useEffect } from 'react'

export default function InstructionProgram({
  connection,
  programId,
}: {
  connection: ConnectionContext
  programId: PublicKey
}) {
  const isNativeSolProgram = isNativeSolanaProgram(programId)
  const [isAnchorVerified, setIsAnchorVerified] = useState(false)
  const [isUpgradeable, setIsUpgradeable] = useState(false)
  const [authority, setAuthority] = useState('')
  const programLabel = getProgramName(programId)
  useEffect(() => {
    const tryGetProgramInfo = async (programId: PublicKey) => {
      try {
        const programAccount = await connection.current.getParsedAccountInfo(
          programId
        )
        const programInfo = await connection.current.getParsedAccountInfo(
          new PublicKey(programAccount.value?.data['parsed']?.info?.programData)
        )
        const info = programInfo.value?.data['parsed']?.info
        const authority = info.authority
        const isUpgradeable =
          programInfo.value?.owner?.equals(BPF_UPGRADE_LOADER_ID) && authority
        setIsUpgradeable(isUpgradeable)
        setAuthority(authority)
        const deploymentSlot = info.slot
        tryGetAnchorInfo(programId, deploymentSlot)
        // eslint-disable-next-line no-empty
      } catch {}
    }
    const tryGetAnchorInfo = async (
      programId: PublicKey,
      lastDeploymentSlot: number
    ) => {
      try {
        const apiUrl = `https://api.apr.dev/api/v0/program/${programId.toBase58()}/latest?limit=5`
        const resp = await axios.get(apiUrl)
        const isLastVersionVerified = resp.data[0].verified === 'Verified'
        const lastDeploymentSlotMatch =
          resp.data[0].verified_slot === lastDeploymentSlot
        setIsAnchorVerified(isLastVersionVerified && lastDeploymentSlotMatch)
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
        {!isNativeSolProgram && (
          <div className="text-primary-light text-[10px]">
            Anchor: {isAnchorVerified ? 'Verified' : 'Unverified'}
          </div>
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
