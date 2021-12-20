import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import {
  AccountMetaData,
  Proposal,
  ProposalInstruction,
} from '../../models/accounts'
import {
  getAccountName,
  getInstructionDescriptor,
  InstructionDescriptor,
} from './tools'
import React, { useEffect, useState } from 'react'
import useWalletStore from '../../stores/useWalletStore'
import { getExplorerUrl } from '../explorer/tools'
import { getProgramName } from './programs/names'
import { tryGetTokenAccount } from '@utils/tokens'
import { ExecuteInstructionButton, PlayState } from './ExecuteInstructionButton'
import { ParsedAccount } from '@models/core/accounts'
import InspectorButton from '@components/explorer/inspectorButton'
import { FlagInstructionErrorButton } from './FlagInstructionErrorButton'

export default function InstructionCard({
  index,
  proposal,
  proposalInstruction,
}: {
  index: number
  proposal: ParsedAccount<Proposal>
  proposalInstruction: ParsedAccount<ProposalInstruction>
}) {
  const connection = useWalletStore((s) => s.connection)
  const tokenRecords = useWalletStore((s) => s.selectedRealm)
  const [descriptor, setDescriptor] = useState<InstructionDescriptor>()
  const [playing, setPlaying] = useState(
    proposalInstruction.info.executedAt ? PlayState.Played : PlayState.Unplayed
  )

  useEffect(() => {
    getInstructionDescriptor(
      connection.current,
      proposalInstruction.info.instruction
    ).then((d) => setDescriptor(d))
  }, [proposalInstruction])

  const proposalAuthority = tokenRecords[proposal.account.owner.toBase58()]

  return (
    <div className="break-all">
      <h3 className="mb-4">
        {`Instruction ${index} `}
        {descriptor?.name && `– ${descriptor.name}`}
      </h3>
      <InstructionProgram
        endpoint={connection.endpoint}
        programId={proposalInstruction.info.instruction.programId}
      ></InstructionProgram>
      <div className="border-b border-bkg-4 mb-6">
        {proposalInstruction.info.instruction.accounts.map((am, idx) => (
          <InstructionAccount
            endpoint={connection.endpoint}
            key={idx}
            index={idx}
            accountMeta={am}
            descriptor={descriptor}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-sm">Data</div>
      </div>
      <InstructionData descriptor={descriptor}></InstructionData>

      <div className="flex justify-start items-center gap-x-4 mt-6 mb-8">
        <InspectorButton
          instructionData={proposalInstruction.info.instruction}
        />

        <FlagInstructionErrorButton
          playState={playing}
          proposal={proposal}
          proposalAuthority={proposalAuthority}
          proposalInstruction={proposalInstruction}
        />

        {proposal && (
          <ExecuteInstructionButton
            proposal={proposal}
            proposalInstruction={proposalInstruction}
            playing={playing}
            setPlaying={setPlaying}
          />
        )}
      </div>
    </div>
  )
}

export function InstructionProgram({
  endpoint,
  programId,
}: {
  endpoint: string
  programId: PublicKey
}) {
  const programLabel = getProgramName(programId)
  return (
    <div className="border-t border-bkg-4 flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
      <span className="font-bold text-fgd-1 text-sm">Program</span>
      <div className="flex items-center pt-1 lg:pt-0">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none"
          href={getExplorerUrl(endpoint, programId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {programId.toBase58()}
          {programLabel && (
            <div className="mt-1 text-fgd-3 lg:text-right text-xs">
              {programLabel}
            </div>
          )}
        </a>
        <ExternalLinkIcon
          className={`flex-shrink-0 h-4 w-4 ml-2 text-primary-light`}
        />
      </div>
    </div>
  )
}

export function InstructionAccount({
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
  const connection = useWalletStore((s) => s.connection)
  const [accountLabel, setAccountLabel] = useState(
    getAccountName(accountMeta.pubkey)
  )

  if (!accountLabel) {
    // Check if the account is SPL token account and if yes then display its owner
    tryGetTokenAccount(connection.current, accountMeta.pubkey).then((ta) => {
      if (ta) {
        setAccountLabel(`owner: ${ta?.account.owner.toBase58()}`)
      }
    })
    // TODO: Extend to other well known account types
  }

  return (
    <div className="border-t border-bkg-4 flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
      <div className="pb-1 lg:pb-0">
        <p className="font-bold text-fgd-1">{`Account ${index + 1}`}</p>
        {descriptor?.accounts && (
          <div className="mt-0.5 text-fgd-3 text-xs">
            {descriptor.accounts[index]?.name}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none"
          href={getExplorerUrl(endpoint, accountMeta.pubkey)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {accountMeta.pubkey.toBase58()}
          {accountLabel && (
            <div className="mt-0.5 text-fgd-3 text-right text-xs">
              {accountLabel}
            </div>
          )}
        </a>
        <ExternalLinkIcon
          className={`flex-shrink-0 h-4 w-4 ml-2 text-primary-light`}
        />
      </div>
    </div>
  )
}

export function InstructionData({
  descriptor,
}: {
  descriptor: InstructionDescriptor | undefined
}) {
  return (
    <div>
      <span className="break-all font-display text-fgd-1 text-xs">
        {descriptor?.dataUI}
      </span>
    </div>
  )
}
