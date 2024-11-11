import { MANGO_INSTRUCTION_FORWARDER } from '@components/instructions/tools'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { useBufferAccountsAuthority } from '@hooks/queries/bufferAuthority'
import { useGovernanceByPubkeyQuery } from '@hooks/queries/governance'
import { useSelectedProposalTransactions } from '@hooks/queries/proposalTransaction'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import useRealm from '@hooks/useRealm'
import {
  BPF_UPGRADE_LOADER_ID,
  Proposal,
  getNativeTreasuryAddress,
} from '@solana/spl-governance'
import { useMemo } from 'react'
import { useAsync } from 'react-async-hook'

const SetRealmConfigWarning = () => (
  <div className="rounded-md bg-yellow-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          Instructions like this one change the way the DAO is governed
        </h3>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            This proposal writes to your realm configuration, which could affect how 
            votes are counted. Both the instruction data AND accounts list contain parameters. 
            Before you vote, make sure you review the proposal&apos;s instructions and the concerned 
            accounts, and understand the implications of passing this proposal.
          </p>
        </div>
      </div>
    </div>
  </div>
)

const ThirdPartyInstructionWritesConfigWarning = () => (
  <div className="rounded-md bg-red-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-red-400"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Danger: This instruction uses an unknown program to modify your Realm
        </h3>
        <div className="mt-2">
          <p className="text-sm text-red-700">
            This proposal writes to your realm configuration, this could affect
            how votes are counted. Writing realm configuration using an unknown
            program is highly unusual.
          </p>
        </div>
      </div>
    </div>
  </div>
)

const SetGovernanceConfig = () => (
  <div className="rounded-md bg-yellow-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          Instructions like this one change the way the DAO is governed
        </h3>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            This proposal writes to your governance configuration, which could affect how 
            votes are counted. Both the instruction data AND accounts list contain parameters. 
            Before you vote, make sure you review the proposal&apos;s instructions and the concerned 
            accounts, and understand the implications of passing this proposal.
          </p>
        </div>
      </div>
    </div>
  </div>
)

const PossibleWrongGovernance = () => (
  <div className="rounded-md bg-yellow-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          Possible wrong governance pass, check accounts.
        </h3>
      </div>
    </div>
  </div>
)

const ProgramUpgrade = () => (
  <div className="rounded-md bg-yellow-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          Instructions like this one are dangerous
        </h3>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            This proposal upgrade program check params carefully
          </p>
        </div>
      </div>
    </div>
  </div>
)

const BufferAuthorityMismatch = () => (
  <div className="rounded-md bg-red-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-red-400"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Danger alert: The current buffer authority does not match the DAO
          wallet
        </h3>
        <div className="mt-2">
          <p className="text-sm text-red-700">
            The current authority can change the buffer account during vote.
          </p>
        </div>
      </div>
    </div>
  </div>
)

const ForwardWarning = () => (
  <div className="rounded-md bg-yellow-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          Instruction use instruction forward program:{' '}
          {MANGO_INSTRUCTION_FORWARDER}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            This means one of instruction is executable only by given wallet
            until time set in proposal, check time and wallet in instruction
            panel
          </p>
        </div>
      </div>
    </div>
  </div>
)

const useProposalSafetyCheck = (proposal: Proposal) => {
  const config = useRealmConfigQuery().data?.result
  const { realmInfo } = useRealm()
  const { data: transactions } = useSelectedProposalTransactions()
  const { data: bufferAuthorities } = useBufferAccountsAuthority()
  const governance = useGovernanceByPubkeyQuery(proposal?.governance).data
    ?.result

  const isUsingForwardProgram = transactions
    ?.flatMap((tx) =>
      tx.account.instructions.flatMap((ins) => ins.programId.toBase58())
    )
    .filter((x) => x === MANGO_INSTRUCTION_FORWARDER).length

  const treasuryAddress = useAsync(
    async () =>
      governance !== undefined
        ? getNativeTreasuryAddress(governance.owner, governance.pubkey)
        : undefined,
    [governance]
  )
  const walletsPassedToInstructions = transactions?.flatMap((tx) =>
    tx.account.instructions?.flatMap((ins) =>
      ins.accounts.map((acc) => acc.pubkey)
    )
  )

  const proposalWarnings = useMemo(() => {
    if (realmInfo === undefined || transactions === undefined) return []

    const ixs = transactions.flatMap((pix) => pix.account.getAllInstructions())

    const possibleWrongGovernance =
      treasuryAddress.result &&
      !!transactions?.length &&
      !walletsPassedToInstructions?.find(
        (x) =>
          x &&
          (governance?.pubkey?.equals(x) || treasuryAddress.result?.equals(x))
      )

    const proposalWarnings: (
      | 'setGovernanceConfig'
      | 'setRealmConfig'
      | 'thirdPartyInstructionWritesConfig'
      | 'possibleWrongGovernance'
      | 'programUpgrade'
      | 'usingMangoInstructionForwarder'
      | 'bufferAuthorityMismatch'
      | undefined
    )[] = []

    proposalWarnings.push(
      ...ixs.map((ix) => {
        if (ix.programId.equals(realmInfo.programId) && ix.data[0] === 19) {
          return 'setGovernanceConfig'
        }
        if (ix.programId.equals(realmInfo.programId) && ix.data[0] === 22) {
          return 'setRealmConfig'
        }
        if (ix.programId.equals(BPF_UPGRADE_LOADER_ID)) {
          return 'programUpgrade'
        }
        if (
          ix.accounts.find(
            (a) => a.isWritable && config && a.pubkey.equals(config.pubkey)
          ) !== undefined
        ) {
          if (ix.programId.equals(realmInfo.programId)) {
            return 'setRealmConfig'
          } else {
            return 'thirdPartyInstructionWritesConfig'
          }
        }
        if (isUsingForwardProgram) {
          return 'usingMangoInstructionForwarder'
        }
      })
    )

    if (possibleWrongGovernance) {
      proposalWarnings.push('possibleWrongGovernance')
    }

    if (treasuryAddress.result) {
      const treasury = treasuryAddress.result
      if (
        governance &&
        bufferAuthorities?.some(
          (authority) =>
            !authority.equals(treasury) && !authority.equals(governance.pubkey)
        )
      ) {
        proposalWarnings.push('bufferAuthorityMismatch')
      }
    }

    return proposalWarnings
  }, [
    realmInfo,
    config,
    transactions,
    walletsPassedToInstructions,
    governance?.pubkey,
    treasuryAddress.result,
  ])

  return proposalWarnings
}

const ProposalWarnings = ({ proposal }: { proposal: Proposal }) => {
  const warnings = useProposalSafetyCheck(proposal)
  return (
    <>
      {warnings?.includes('setGovernanceConfig') && <SetGovernanceConfig />}
      {warnings?.includes('setRealmConfig') && <SetRealmConfigWarning />}
      {warnings?.includes('thirdPartyInstructionWritesConfig') && (
        <ThirdPartyInstructionWritesConfigWarning />
      )}
      {warnings?.includes('possibleWrongGovernance') && (
        <PossibleWrongGovernance></PossibleWrongGovernance>
      )}
      {warnings?.includes('programUpgrade') && (
        <ProgramUpgrade></ProgramUpgrade>
      )}
      {warnings?.includes('usingMangoInstructionForwarder') && (
        <ForwardWarning></ForwardWarning>
      )}
      {warnings?.includes('bufferAuthorityMismatch') && (
        <BufferAuthorityMismatch />
      )}
    </>
  )
}
export default ProposalWarnings
