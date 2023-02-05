import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { abbreviateAddress, precision } from 'utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { FC, useMemo, useState } from 'react'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import {
  createRevokeGoverningTokens,
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import AddMemberIcon from '@components/AddMemberIcon'
import useCreateProposal from '@hooks/useCreateProposal'
import useProgramVersion from '@hooks/useProgramVersion'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import BigNumber from 'bignumber.js'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'

interface Form {
  description?: string
  title?: string
  amount: number
}

const RevokeMembershipForm: FC<{
  close: () => void
  mint: PublicKey
  governance: PublicKey
  member: PublicKey
}> = ({ close, mint, member, governance }) => {
  const programVersion = useProgramVersion()
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const { handleCreateProposal } = useCreateProposal()
  const router = useRouter()

  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query

  const { realmInfo, canChooseWhoVote, realm } = useRealm()
  const { data: mintInfo } = useMintInfoByPubkeyQuery(mint)

  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<Form>({ amount: 1 })

  const mintMinAmount = mintInfo?.found
    ? // @ts-expect-error this discrimination fails on 4.6 but not future versions of TS
      new BigNumber(1).shiftedBy(mintInfo.result.decimals).toNumber()
    : 1

  const currentPrecision = precision(mintMinAmount)
  const govpop =
    realm !== undefined &&
    (mint.equals(realm.account.communityMint)
      ? 'community '
      : realm.account.config.councilMint &&
        mint.equals(realm.account.config.councilMint)
      ? 'council '
      : '')
  let abbrevAddress: string
  try {
    abbrevAddress = abbreviateAddress(member)
  } catch {
    abbrevAddress = ''
  }
  // note the lack of space is not a typo
  const proposalTitle = `Remove ${govpop}member ${abbrevAddress}`

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const setAmount = (event) => {
    const value = event.target.value

    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const validateAmountOnBlur = () => {
    const value = form.amount ?? 1

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  const handlePropose = async () => {
    setIsLoading(true)

    if (
      realm === undefined ||
      programId === undefined ||
      mintInfo?.result === undefined
    ) {
      throw new Error('proposal created before necessary data is fetched')
    }

    const ix = await createRevokeGoverningTokens(
      programId,
      programVersion,
      realm.pubkey,
      member,
      mint,
      governance,
      getMintNaturalAmountFromDecimalAsBN(
        form.amount,
        mintInfo?.result.decimals
      )
    )

    let proposalAddress: PublicKey | null = null

    try {
      const selectedGovernance = (await fetchRealmGovernance(
        governance
      )) as ProgramAccount<Governance>

      const serializedInstruction = serializeInstructionToBase64(ix)

      const instructionData = {
        data: getInstructionDataFromBase64(serializedInstruction),
        holdUpTime: selectedGovernance.account.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      }
      console.log(instructionData)

      proposalAddress = await handleCreateProposal({
        title: form.title ? form.title : proposalTitle,
        description: form.description ? form.description : '',
        governance: selectedGovernance,
        instructionsData: [instructionData],
        voteByCouncil,
        isDraft: false,
      })

      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )

      router.push(url)
    } catch (error) {
      notify({
        type: 'error',
        message: `${error}`,
      })

      close()
    }

    setIsLoading(false)
  }

  return (
    <>
      <div className="flex justify-start items-center gap-x-3">
        <AddMemberIcon className="w-8 mb-2" />

        <h2 className="text-xl">Add new member to {realmInfo?.displayName}</h2>
      </div>

      <>
        <Input
          noMaxWidth
          useDefaultStyle={false}
          className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
          wrapperClassName="mb-6"
          label="Title of your proposal"
          placeholder="Title of your proposal"
          value={form.title ? form.title : proposalTitle}
          type="text"
          onChange={(event) =>
            handleSetForm({
              value: event.target.value,
              propertyName: 'title',
            })
          }
        />

        <Input
          noMaxWidth
          useDefaultStyle={false}
          className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
          wrapperClassName="mb-6"
          label="Description"
          placeholder="Description of your proposal (optional)"
          value={form.description}
          type="text"
          onChange={(event) =>
            handleSetForm({
              value: event.target.value,
              propertyName: 'description',
            })
          }
        />

        <Input
          noMaxWidth
          useDefaultStyle={false}
          className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
          wrapperClassName="mb-6"
          min={mintMinAmount}
          label="Voter weight"
          value={form.amount}
          type="number"
          onChange={setAmount}
          step={mintMinAmount}
          error={formErrors['amount']}
          onBlur={validateAmountOnBlur}
        />

        {canChooseWhoVote && (
          <VoteBySwitch
            checked={voteByCouncil}
            onChange={() => {
              setVoteByCouncil(!voteByCouncil)
            }}
          />
        )}
      </>

      <div className="flex gap-x-6 justify-end items-center mt-8">
        <SecondaryButton
          disabled={isLoading}
          className="w-44"
          onClick={() => close()}
        >
          Cancel
        </SecondaryButton>

        <Button
          disabled={isLoading}
          className="w-44 flex justify-center items-center"
          onClick={() => handlePropose()}
        >
          Add proposal
        </Button>
      </div>
    </>
  )
}

const useCouncilMintAccount = () => {
  const { realm } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const councilMintAccount = useMemo(
    () =>
      assetAccounts.find(
        (x) =>
          x.governance?.account.governedAccount.toBase58() ===
          realm?.account.config.councilMint?.toBase58()
      ),
    [assetAccounts, realm?.account.config.councilMint]
  )
  return councilMintAccount
}
export const RevokeCouncilMembershipForm: FC<{
  member: PublicKey
  close: () => void
}> = (props) => {
  const councilMintAccount = useCouncilMintAccount()
  return councilMintAccount ? (
    <RevokeMembershipForm
      {...props}
      mint={councilMintAccount.pubkey}
      governance={councilMintAccount.governance.pubkey}
    />
  ) : (
    <div>Council not found</div>
  )
}

export default RevokeMembershipForm
