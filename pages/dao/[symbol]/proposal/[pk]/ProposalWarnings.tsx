import { ExclamationCircleIcon } from '@heroicons/react/solid'
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
          Instructions like this one are dangerous
        </h3>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            This proposal writes to your realm configuration, this could affect
            how votes are counted. Both the instruction data AND accounts list
            contain parameters. Do not pass this proposal if there are any
            accounts you do not recognize.
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
          Instructions like this one are dangerous
        </h3>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            This proposal writes to your governance configuration, this could
            affect how votes are counted. Both the instruction data AND accounts
            list contain parameters. Do not pass this proposal if there are any
            accounts you do not recognize.
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
          Instructions like this one are dangerous
        </h3>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            This proposal writes to your governance configuration, this could
            affect how votes are counted. Both the instruction data AND accounts
            list contain parameters. Do not pass this proposal if there are any
            accounts you do not recognize.
          </p>
        </div>
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

const useProposalSafetyCheck = (proposal: Proposal) => {
  const config = useRealmConfigQuery().data?.result
  const { realmInfo } = useRealm()
  const { data: transactions } = useSelectedProposalTransactions()
  const governance = useGovernanceByPubkeyQuery(proposal?.governance).data
    ?.result

  const treasuryAddress = useAsync(
    async () =>
      governance !== undefined
        ? getNativeTreasuryAddress(governance.owner, governance.pubkey)
        : undefined,
    [governance]
  )
  const walletsPassedToInstructions = transactions?.flatMap((tx) =>
    tx.account.instructions.flatMap((ins) =>
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
        (x) => governance?.pubkey.equals(x) || treasuryAddress.result?.equals(x)
      )

    const proposalWarnings: (
      | 'setGovernanceConfig'
      | 'setRealmConfig'
      | 'thirdPartyInstructionWritesConfig'
      | 'possibleWrongGovernance'
      | 'programUpgrade'
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
      })
    )

    if (possibleWrongGovernance) {
      proposalWarnings.push('possibleWrongGovernance')
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
    </>
  )
}
export default ProposalWarnings
