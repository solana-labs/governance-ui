import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { AccountMetaData, ProposalInstruction } from '../../models/accounts'
import {
  getAccountName,
  getInstructionDescriptor,
  getProgramName,
  InstructionDescriptor,
} from './tools'
import React from 'react'
import InspectorButton from '../explorer/inspectorButton'

export default function InstructionCard({
  index,
  proposalInstruction,
}: {
  index: number
  proposalInstruction: ProposalInstruction
}) {
  const instructionId = proposalInstruction.instruction.data[0]
  const descriptor = getInstructionDescriptor(
    proposalInstruction.instruction.programId,
    instructionId
  )

  return (
    <div>
      <h3 className="mb-4">
        {`Instruction ${index} `}
        {descriptor && `– ${descriptor.name}`}
      </h3>
      <InstructionProgram
        programId={proposalInstruction.instruction.programId}
      ></InstructionProgram>
      <div className="border-b border-bkg-4 mb-6">
        {proposalInstruction.instruction.accounts.map((am, idx) => (
          <InstructionAccount
            key={idx}
            index={idx}
            accountMeta={am}
            descriptor={descriptor}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-sm">Data</div>
        <InspectorButton
          instructionData={proposalInstruction.instruction}
        ></InspectorButton>
      </div>
      <InstructionData
        data={proposalInstruction.instruction.data}
        descriptor={descriptor}
        accounts={proposalInstruction.instruction.accounts}
      ></InstructionData>
    </div>
  )
}

export function InstructionProgram({ programId }: { programId: PublicKey }) {
  const programLabel = getProgramName(programId)
  return (
    <div className="border-t border-bkg-4 flex items-center justify-between py-3">
      <span className="font-bold text-fgd-1 text-sm">Program</span>
      <div className="flex items-center">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none"
          href={`https://explorer.solana.com/address/${programId.toBase58()}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {programId.toBase58()}
          {programLabel && (
            <div className="mt-1 text-fgd-3 text-right text-xs">
              {programLabel}
            </div>
          )}
        </a>
        <ExternalLinkIcon className={`h-4 w-4 ml-2 text-primary-light`} />
      </div>
    </div>
  )
}

export function InstructionAccount({
  index,
  accountMeta,
  descriptor,
}: {
  index: number
  accountMeta: AccountMetaData
  descriptor: InstructionDescriptor | undefined
}) {
  const accountLabel = getAccountName(accountMeta.pubkey)

  return (
    <div className="border-t border-bkg-4 flex items-center justify-between py-3">
      <div>
        <p className="font-bold text-fgd-1">{`Account ${index + 1}`}</p>
        {descriptor && (
          <div className="mt-1 text-fgd-3 text-xs">
            {descriptor.accounts[index]?.name}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none"
          href={`https://explorer.solana.com/address/${accountMeta.pubkey.toString()}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {accountMeta.pubkey.toBase58()}
          {accountLabel && (
            <div className="mt-1 text-fgd-3 text-right text-xs">
              {accountLabel}
            </div>
          )}
        </a>
        <ExternalLinkIcon className={`h-4 w-4 ml-2 text-primary-light`} />
      </div>
    </div>
  )
}

export function InstructionData({
  data,
  descriptor,
  accounts,
}: {
  data: Uint8Array
  descriptor: InstructionDescriptor | undefined
  accounts: AccountMetaData[]
}) {
  const getDataUI =
    descriptor?.getDataUI ?? ((data, _accounts) => <>{JSON.stringify(data)}</>)

  console.log(getDataUI(data, accounts))

  return (
    <div>
      <span className="break-all font-display text-fgd-1 text-xs">
        {getDataUI(data, accounts)}
      </span>
    </div>
  )
}
