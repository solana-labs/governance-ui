import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'
import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button from '@components/Button'
import Textarea from 'components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import useWalletStore from 'stores/useWalletStore'
import { getValidatedPublickKey } from 'utils/validations'
import { useEffect, useState } from 'react'
import { UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { createProposal } from 'actions/createProposal'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { validateInstruction } from 'utils/instructionTools'
import useAssetsStore from 'stores/useAssetsStore'
import * as yup from 'yup'
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
import { getProgramVersionForRealm } from '@models/registry/api'
import ProgramUpgradeInfo from 'pages/dao/[symbol]/proposal/components/instructions/bpfUpgradeableLoader/ProgramUpgradeInfo'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import { BPF_UPGRADE_LOADER_ID, GovernedProgramAccount } from '@utils/tokens'
import Loading from '@components/Loading'

interface CloseBuffersForm {
  governedAccount: GovernedProgramAccount | undefined
  programId: string | undefined
  solReceiverAddress: string
  description: string
  title: string
}

const CloseBuffers = () => {
  const { resetCompactViewState } = useAssetsStore()
  const router = useRouter()
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const program = useAssetsStore((s) => s.compact.currentAsset)
  const governedAccount = {
    governance: program!,
  }
  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query
  const {
    realmInfo,
    canChooseWhoVote,
    councilMint,
    realm,
    ownVoterWeight,
    mint,
  } = useRealm()
  const [isBuffersLoading, setIsBuffersLoading] = useState(false)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [buffers, setBuffers] = useState<
    {
      pubkey: PublicKey
      account: AccountInfo<Buffer | ParsedAccountData>
    }[]
  >([])
  const [form, setForm] = useState<CloseBuffersForm>({
    governedAccount: governedAccount,
    programId: programId?.toString(),
    solReceiverAddress: '',
    description: '',
    title: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Upgrade ${form.governedAccount?.governance?.account.governedAccount.toBase58()}`

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const schema = yup.object().shape({
    solReceiverAddress: yup
      .string()
      .test('accountTests', 'Account validation error', function (val: string) {
        if (val) {
          try {
            return !!getValidatedPublickKey(val)
          } catch (e) {
            console.log(e)
            return this.createError({
              message: `${e}`,
            })
          }
        } else {
          return this.createError({
            message: `Retrieved SOL receiver address is required`,
          })
        }
      }),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const upgradeIx = await createUpgradeInstruction(
        form.governedAccount.governance.account.governedAccount,
        new PublicKey(form.solReceiverAddress),
        form.governedAccount.governance.pubkey,
        wallet!.publicKey
      )
      serializedInstruction = serializeInstructionToBase64(upgradeIx)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  const handlePropose = async () => {
    setIsLoading(true)
    const instruction: UiInstruction = await getInstruction()
    if (instruction.isValid) {
      const governance = form.governedAccount?.governance
      let proposalAddress: PublicKey | null = null
      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )
      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }
      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ProgramAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance!.account.config
        )

        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm.account.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.account.config.councilMint
            : defaultProposalMint

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }
        //Description same as title
        proposalAddress = await createProposal(
          rpcContext,
          realm,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title ? form.title : proposalTitle,
          form.description ? form.description : '',
          proposalMint,
          selectedGovernance?.account?.proposalCount,
          [instructionData],
          false,
          client
        )
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        resetCompactViewState()
        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    const getBuffers = async () => {
      try {
        setBuffers([])
        setIsBuffersLoading(true)
        const buffers = await connection.current.getParsedProgramAccounts(
          BPF_UPGRADE_LOADER_ID,
          {
            filters: [
              {
                memcmp: {
                  offset: 5,
                  bytes: form.governedAccount!.governance!.pubkey.toBase58(),
                },
              },
            ],
          }
        )
        setBuffers(buffers)
      } catch (e) {
        notify({ type: 'error', message: "Can't fetch buffers" })
      }
      setIsBuffersLoading(false)
    }
    if (form.governedAccount?.governance?.pubkey.toBase58()) {
      getBuffers()
    }
  }, [form.governedAccount?.governance?.pubkey.toBase58()])
  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">Upgrade</h3>
      <div className="space-y-4">
        <Input
          label="Retrieved SOL receiver address"
          value={form.solReceiverAddress}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'solReceiverAddress',
            })
          }
          noMaxWidth={true}
          error={formErrors['solReceiverAddress']}
        />
        <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
          <p className="text-fgd-3 text-xs">Bufffers to close</p>
          {isBuffersLoading ? (
            <Loading></Loading>
          ) : (
            <>
              {' '}
              {buffers.map((x) => (
                <div className="mb-2" key={x.pubkey.toBase58()}>
                  {x.pubkey.toBase58()}
                </div>
              ))}
              {!buffers.length && 'No buffers found'}
            </>
          )}
        </div>
        <ProgramUpgradeInfo
          governancePk={form.governedAccount?.governance?.pubkey}
        ></ProgramUpgradeInfo>
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
              label="Proposal Title"
              placeholder={proposalTitle}
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
              label="Proposal Description"
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
        <Button
          className="ml-auto"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          <div>Propose close all</div>
        </Button>
      </div>
    </>
  )
}

export default CloseBuffers
