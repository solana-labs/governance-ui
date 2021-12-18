import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline'
import { ViewState } from './types'
import useMembersListStore from 'stores/useMembersListStore'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import useRealm from '@hooks/useRealm'
import Input from '@components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import Textarea from '@components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import {
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { getMintSchema } from '@utils/validations'
import { useEffect, useState } from 'react'
import { MintForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { validateInstruction } from '@utils/instructionTools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@models/serialisation'
import { getATA } from '@utils/ataTools'
import { RpcContext } from '@models/core/api'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { useRouter } from 'next/router'
import { createProposal } from 'actions/createProposal'
import { notify } from '@utils/notifications'
import useQueryContext from '@hooks/useQueryContext'

interface AddMemberForm extends MintForm {
  description: string
  title: string
}

//Can add only council members for now
const AddMember = () => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query
  const { setCurrentCompactView } = useMembersListStore()
  const { getMintWithGovernances } = useGovernanceAssets()
  const {
    realmInfo,
    canChooseWhoVote,
    councilMint,
    realm,
    ownVoterWeight,
    mint,
  } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<AddMemberForm>({
    destinationAccount: '',
    amount: 1,
    mintAccount: undefined,
    programId: programId?.toString(),
    description: '',
    title: '',
  })
  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(councilMint!)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Add council member ${form.destinationAccount}`
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
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
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
  const schema = getMintSchema({ form, connection })
  //TODO common getMintInstruction
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    if (isValid && programId && form.mintAccount?.governance?.pubkey) {
      //this is the original owner
      const destinationAccount = new PublicKey(form.destinationAccount)
      const mintPK = form.mintAccount.governance.info.governedAccount
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.mintAccount.mintInfo?.decimals
      )
      //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
      const { currentAddress: receiverAddress, needToCreateAta } = await getATA(
        connection,
        destinationAccount,
        mintPK,
        wallet!
      )
      //we push this createATA instruction to transactions to create right before creating proposal
      //we don't want to create ata only when instruction is serialized
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            mintPK, // mint
            receiverAddress, // ata
            destinationAccount, // owner of token account
            wallet!.publicKey! // fee payer
          )
        )
      }
      const transferIx = Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        form.mintAccount.governance.info.governedAccount,
        receiverAddress,
        form.mintAccount.governance!.pubkey,
        [],
        mintAmount
      )
      serializedInstruction = serializeInstructionToBase64(transferIx)
    }
    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governance: form.mintAccount?.governance,
      prerequisiteInstructions: prerequisiteInstructions,
    }
    return obj
  }
  //TODO common handle propose
  const handlePropose = async () => {
    setIsLoading(true)
    const instruction: UiInstruction = await getInstruction()
    if (instruction.isValid) {
      const governance = form.mintAccount?.governance
      let proposalAddress: PublicKey | null = null
      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.account.owner.toString()),
        realmInfo?.programVersion,
        wallet,
        connection.current,
        connection.endpoint
      )
      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.info?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }
      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ParsedAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance!.info.config
        )

        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.info.communityMint
          : !councilMint?.supply.isZero()
          ? realm.info.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.info.config.councilMint
            : defaultProposalMint

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }
        //Description same as title
        proposalAddress = await createProposal(
          rpcContext,
          realm.pubkey,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title ? form.title : proposalTitle,
          form.description ? form.description : '',
          proposalMint,
          selectedGovernance?.info?.proposalCount,
          [instructionData],
          false
        )
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    }
    setIsLoading(false)
  }
  useEffect(() => {
    async function getMintWithGovernancesFcn() {
      const resp = await getMintWithGovernances()
      handleSetForm({
        value: resp.find(
          (x) =>
            x.governance?.pubkey.toBase58() ===
            realm?.info.config.councilMint?.toBase58()
        ),
        propertyName: 'destinationAccount',
      })
    }
    getMintWithGovernancesFcn()
  }, [])
  console.log(form)
  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 mr-1 text-primary-light mr-2"
          />
          Add new member
        </>
      </h3>
      <div className="space-y-4">
        <Input
          label="Destination wallet"
          value={form.destinationAccount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'destinationAccount',
            })
          }
          noMaxWidth={true}
          error={formErrors['destinationAccount']}
        />
        <div
          className={'flex items-center hover:cursor-pointer w-24 mt-3'}
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
              noMaxWidth={true}
              label="Title"
              placeholder={
                form.amount && form.destinationAccount
                  ? proposalTitle
                  : 'Title of your proposal'
              }
              value={form.title}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
            <Textarea
              noMaxWidth={true}
              label="Description"
              placeholder={
                'Description of your proposal or use a github gist link (optional)'
              }
              wrapperClassName="mb-5"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            <Input
              min={mintMinAmount}
              label="Amount"
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
              ></VoteBySwitch>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <SecondaryButton
          disabled={isLoading}
          className="sm:w-1/2 text-th-fgd-1"
          onClick={handleGoBackToMainView}
        >
          Cancel
        </SecondaryButton>
        <Button
          className="sm:w-1/2"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          <div>Propose</div>
        </Button>
      </div>
    </>
  )
}

export default AddMember
