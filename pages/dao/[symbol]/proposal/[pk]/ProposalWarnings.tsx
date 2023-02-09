import { ExclamationCircleIcon } from '@heroicons/react/solid'
import useProposal from '@hooks/useProposal'
import useRealm from '@hooks/useRealm'
import { useMemo } from 'react'

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

const useProposalSafetyCheck = () => {
  const { config, realmInfo, realm } = useRealm()
  const { instructions } = useProposal()
  const realmConfigWarnings = useMemo(() => {
    if (realmInfo === undefined || config === undefined) return undefined

    const ixs = Object.values(instructions).flatMap((pix) =>
      pix.account.getAllInstructions()
    )

    const realmConfigWarnings = ixs.map((ix) => {
      if (ix.programId.equals(realmInfo.programId) && ix.data[0] === 19) {
        return 'setGovernanceConfig'
      }
      if (ix.programId.equals(realmInfo.programId) && ix.data[0] === 22) {
        return 'setRealmConfig'
      }
      if (
        ix.accounts.find(
          (a) => a.isWritable && a.pubkey.equals(config.pubkey)
        ) !== undefined
      ) {
        if (ix.programId.equals(realmInfo.programId)) {
          return 'setRealmConfig'
        } else {
          return 'ThirdPartyInstructionWritesConfig'
        }
      }
    })

    return realmConfigWarnings
  }, [config, instructions, realm?.owner, realmInfo])

  return realmConfigWarnings
}

const ProposalWarnings = () => {
  const warnings = useProposalSafetyCheck()
  return (
    <>
      {warnings?.includes('setGovernanceConfig') && <SetGovernanceConfig />}
      {warnings?.includes('setRealmConfig') && <SetRealmConfigWarning />}
      {warnings?.includes('ThirdPartyInstructionWritesConfig') && (
        <ThirdPartyInstructionWritesConfigWarning />
      )}
    </>
  )
}
export default ProposalWarnings
