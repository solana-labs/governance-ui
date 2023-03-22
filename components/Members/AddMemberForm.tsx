import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { abbreviateAddress, precision } from 'utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { getMintSchema } from 'utils/validations'
import { FC, useMemo, useState } from 'react'
import { MintForm, UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
  withDepositGoverningTokens,
} from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { getMintInstruction, validateInstruction } from 'utils/instructionTools'
import AddMemberIcon from '@components/AddMemberIcon'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'
import useCreateProposal from '@hooks/useCreateProposal'
import { AssetAccount } from '@utils/uiTypes/assets'
import useProgramVersion from '@hooks/useProgramVersion'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import BigNumber from 'bignumber.js'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'

interface AddMemberForm extends Omit<MintForm, 'mintAccount'> {
  description: string
  title: string
}

const AddMemberForm: FC<{ close: () => void; mintAccount: AssetAccount }> = ({
  close,
  mintAccount,
}) => {
  const programVersion = useProgramVersion()
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const { handleCreateProposal } = useCreateProposal()
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query

  const { realmInfo, canChooseWhoVote, realm } = useRealm()
  const { data: mintInfo } = useMintInfoByPubkeyQuery(mintAccount.pubkey)

  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<AddMemberForm>({
    destinationAccount: '',
    amount: 1,
    programId: programId?.toString(),
    description: '',
    title: '',
  })

  const schema = getMintSchema({ form: { ...form, mintAccount }, connection })

  const mintMinAmount = mintInfo?.found
    ? new BigNumber(1).shiftedBy(mintInfo.result.decimals).toNumber()
    : 1

  const currentPrecision = precision(mintMinAmount)

  const govpop =
    realm !== undefined &&
    (mintAccount.pubkey.equals(realm.account.communityMint)
      ? 'community '
      : realm.account.config.councilMint &&
        mintAccount.pubkey.equals(realm.account.config.councilMint)
      ? 'council '
      : '')
  let abbrevAddress: string
  try {
    abbrevAddress = abbreviateAddress(new PublicKey(form.destinationAccount))
  } catch {
    abbrevAddress = ''
  }
  // note the lack of space is not a typo
  const proposalTitle = `Add ${govpop}member ${abbrevAddress}`

  const setAmount = (event) => {
    const value = event.target.value

    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateAmountOnBlur = () => {
    const value = form.amount

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

  const getInstruction = async (): Promise<UiInstruction | false> => {
    if (programVersion >= 3) {
      const isValid = await validateInstruction({
        schema,
        form: { ...form, mintAccount },
        setFormErrors,
      })
      if (!isValid) {
        return false
      }

      if (
        programId === undefined ||
        realm === undefined ||
        form.destinationAccount === undefined ||
        !wallet?.publicKey ||
        mintInfo?.result === undefined
      ) {
        return false
      }

      const goofySillyArrayForBuilderPattern = []
      const tokenMint = mintAccount.pubkey
      // eslint-disable-next-line
      const tokenOwnerRecordPk = await withDepositGoverningTokens(
        goofySillyArrayForBuilderPattern,
        programId,
        programVersion,
        realm.pubkey,
        tokenMint,
        tokenMint,
        new PublicKey(form.destinationAccount),
        mintAccount.extensions.mint!.account.mintAuthority!,
        new PublicKey(form.destinationAccount),
        getMintNaturalAmountFromDecimalAsBN(
          form.amount ?? 1,
          mintInfo?.result.decimals
        ),
        true // make recipient a signer
      )
      const ix = goofySillyArrayForBuilderPattern[0]

      // This is not needed if we make the recipient a signer, which we do now
      /* 
      const prerequisiteInstructions: TransactionInstruction[] = []
      // now we have to see if recipient has token owner record already or not.
      // this is due to a bug -- unnecessary signer check in program if there's not a token owner record.
      const mustCreateTOR =
        (await connection.current.getAccountInfo(tokenOwnerRecordPk)) === null
      if (mustCreateTOR) {
        await withCreateTokenOwnerRecord(
          prerequisiteInstructions,
          programId,
          programVersion,
          realm.pubkey,
          new PublicKey(form.destinationAccount),
          tokenMint,
          wallet.publicKey
        )
      } */

      return {
        serializedInstruction: serializeInstructionToBase64(ix),
        isValid: true,
        governance: mintAccount.governance,
        //prerequisiteInstructions,
      }
    } else {
      const mintInstruction = await getMintInstruction({
        schema,
        form: { ...form, mintAccount },
        programId,
        connection,
        wallet,
        governedMintInfoAccount: mintAccount,
        setFormErrors,
      })
      return mintInstruction.isValid ? mintInstruction : false
    }
  }

  //TODO common handle propose
  const handlePropose = async () => {
    setIsLoading(true)

    const instruction = await getInstruction()

    if (!!instruction && wallet && realmInfo) {
      const governance = mintAccount.governance

      let proposalAddress: PublicKey | null = null

      if (!realm) {
        setIsLoading(false)

        throw new Error('No realm selected')
      }
      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }

      try {
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ProgramAccount<Governance>

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
    }

    setIsLoading(false)
  }

  return (
    <>
      <div className="flex justify-start items-center gap-x-3">
        <AddMemberIcon className="w-8 mb-2" />

        <h2 className="text-xl">Add new member to {realmInfo?.displayName}</h2>
      </div>

      <Input
        useDefaultStyle={false}
        className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
        wrapperClassName="my-6"
        label="Member's wallet"
        placeholder="Member's wallet"
        value={form.destinationAccount}
        type="text"
        onChange={(event) =>
          handleSetForm({
            value: event.target.value,
            propertyName: 'destinationAccount',
          })
        }
        noMaxWidth
        error={formErrors['destinationAccount']}
      />

      <div
        className={'flex items-center hover:cursor-pointer w-24 my-3'}
        onClick={() => setShowOptions(!showOptions)}
      >
        {showOptions ? (
          <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
        ) : (
          <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
        )}
        <small className="text-fgd-3">Options</small>
      </div>

      {showOptions && (
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
      )}

      <div className="flex gap-x-6 justify-end items-center mt-8">
        <SecondaryButton
          disabled={isLoading}
          className="w-44"
          onClick={() => close()}
        >
          Cancel
        </SecondaryButton>

        <Button
          disabled={!form.destinationAccount || isLoading}
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
          x.pubkey.toBase58() === realm?.account.config.councilMint?.toBase58()
      ),
    [assetAccounts, realm?.account.config.councilMint]
  )
  return councilMintAccount
}
export const AddCouncilMemberForm: FC<{ close: () => void }> = (props) => {
  const councilMintAccount = useCouncilMintAccount()
  return councilMintAccount ? (
    <AddMemberForm {...props} mintAccount={councilMintAccount} />
  ) : (
    <div>Council not found</div>
  )
}

export default AddMemberForm
