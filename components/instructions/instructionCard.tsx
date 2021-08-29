import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { AccountMetaData, ProposalInstruction } from '../../models/accounts'
import { abbreviateAddress } from '../../utils/formatting'
import {
  getAccountName,
  getInstructionDescriptor,
  getProgramName,
  InstructionDescriptor,
} from './tools'

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
      <div className="pb-6">
        <h3 className="mb-2">
          <span className="mr-2 text-fgd-3">{`#${index}`}</span>
          {descriptor && `${descriptor.name}`}
        </h3>
        <InstructionProgram
          programId={proposalInstruction.instruction.programId}
        ></InstructionProgram>
      </div>
      {/* <h3 className="mb-2">Accounts</h3> */}
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
      <h3 className="mb-2">Data</h3>
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
    <div>
      <div>
        <span className="bg-bkg-3 rounded-full mr-2 px-2 py-1 text-fgd-1 text-xs">
          ProgramID
        </span>
        <span className="text-sm text-fgd-1">{programId.toBase58()}</span>
        {programLabel && (
          <span className="text-fgd-3 text-xs">{` (${programLabel})`}</span>
        )}
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
    <div className="border-t border-bkg-4 py-3 last-child:border-b last-child:border-bkg-4">
      <p className="font-bold mb-2 text-fgd-3">{`Account ${index + 1}`}</p>
      <div className="flex items-center">
        {descriptor && (
          <div className="bg-bkg-3 rounded-full mr-2 px-2 py-1 text-fgd-1 text-xs">{` ${descriptor.accounts[index].name}`}</div>
        )}
        <a
          className="flex items-center text-sm hover:brightness-[1.15] focus:outline-none"
          href={`https://explorer.solana.com/address/${accountMeta.pubkey.toString()}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>
            {abbreviateAddress(accountMeta.pubkey)}{' '}
            {accountLabel && (
              <span className="text-fgd-3 text-xs">{` (${accountLabel})`}</span>
            )}
          </span>
          <ExternalLinkIcon className={`h-4 w-4 ml-1.5 text-primary-light`} />
        </a>
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
      <span className="text-sm text-fgd-1">{getDataUI(data, accounts)}</span>
    </div>
  )
}
