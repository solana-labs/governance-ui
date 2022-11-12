import { ExternalLinkIcon } from '@heroicons/react/outline'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { LinkButton } from '@components/Button'
import Textarea from 'components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import useWalletStore from 'stores/useWalletStore'
import { getValidatedPublickKey } from 'utils/validations'
import { useEffect, useState } from 'react'
import { UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { validateInstruction } from 'utils/instructionTools'
import * as yup from 'yup'
import { BPF_UPGRADE_LOADER_ID } from '@utils/tokens'
import Loading from '@components/Loading'
import useCreateProposal from '@hooks/useCreateProposal'
import { getExplorerUrl } from '@components/explorer/tools'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { createCloseBuffer } from '@tools/sdk/bpfUpgradeableLoader/createCloseBuffer'
import { abbreviateAddress } from '@utils/formatting'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { AssetAccount } from '@utils/uiTypes/assets'

interface CloseBuffersForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  solReceiverAddress: string
  description: string
  title: string
}

const CloseBuffers = ({ program }: { program: ProgramAccount<Governance> }) => {
  const { handleCreateProposal } = useCreateProposal()
  const {
    governedTokenAccountsWithoutNfts,
    assetAccounts,
  } = useGovernanceAssets()
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const governedAccount = assetAccounts.find(
    (x) => x.governance.pubkey.toBase58() === program.pubkey.toBase58()
  )
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = router.query
  const { realmInfo, canChooseWhoVote, realm } = useRealm()
  const [isBuffersLoading, setIsBuffersLoading] = useState(false)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [buffers, setBuffers] = useState<
    {
      pubkey: PublicKey
      account: AccountInfo<Buffer | ParsedAccountData>
    }[]
  >([])
  const highestLampartsAmountInGovernedTokenAccounts = Math.max(
    ...governedTokenAccountsWithoutNfts
      .filter((x) => x.isSol)
      .map((x) => x.extensions!.solAccount!.lamports)
  )
  const solAccounts = governedTokenAccountsWithoutNfts.filter((x) => x.isSol)
  const [form, setForm] = useState<CloseBuffersForm>({
    governedAccount: governedAccount,
    programId: programId?.toString(),
    solReceiverAddress: solAccounts.length
      ? solAccounts
          .find(
            (x) =>
              x.extensions.solAccount?.lamports ===
              highestLampartsAmountInGovernedTokenAccounts
          )!
          .extensions.transferAddress!.toBase58()
      : wallet?.publicKey?.toBase58()
      ? wallet?.publicKey?.toBase58()
      : '',
    description: '',
    title: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Close buffers for program ${
    form.governedAccount?.governance?.account.governedAccount
      ? abbreviateAddress(
          form.governedAccount?.governance?.account.governedAccount
        )
      : ''
  }`

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
  async function getInstructions(): Promise<UiInstruction[]> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const instructions: UiInstruction[] = []
    for (let i = 0; i < buffers.length; i++) {
      let serializedInstruction = ''
      if (
        isValid &&
        programId &&
        form.governedAccount?.governance?.account &&
        wallet?.publicKey
      ) {
        const closeIx = await createCloseBuffer(
          buffers[i].pubkey,
          new PublicKey(form.solReceiverAddress),
          form.governedAccount.governance.pubkey
        )
        serializedInstruction = serializeInstructionToBase64(closeIx)
      }
      const obj: UiInstruction = {
        serializedInstruction: serializedInstruction,
        isValid,
        governance: form.governedAccount?.governance,
      }
      instructions.push(obj)
    }
    return instructions
  }
  const handlePropose = async () => {
    setIsLoading(true)
    const instructions: UiInstruction[] = await getInstructions()
    if (instructions.length && instructions[0].isValid) {
      const governance = form.governedAccount?.governance
      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
      }

      const instructionsData = instructions.map(
        (x) =>
          new InstructionDataWithHoldUpTime({
            instruction: x,
            governance,
          })
      )
      try {
        const proposalAddress = await handleCreateProposal({
          title: form.title ? form.title : proposalTitle,
          description: form.description ? form.description : '',
          voteByCouncil,
          instructionsData: instructionsData,
          governance: governance!,
        })
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
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.governedAccount?.governance?.pubkey.toBase58()])
  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        Close buffers
      </h3>
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
        <div className="border border-fgd-4 mb-4 px-4 py-3 rounded-md w-full">
          <p className="mb-0.5 text-xs">Bufffers to close</p>
          {isBuffersLoading ? (
            <Loading />
          ) : (
            <div className="space-y-2">
              {buffers.map((x) => (
                <a
                  className="default-transition flex items-center text-fgd-1 hover:text-fgd-3 text-xs"
                  key={x.pubkey.toBase58()}
                  href={getExplorerUrl(connection.cluster, x.pubkey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {x.pubkey.toBase58()}
                  <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 text-primary-light w-4" />
                </a>
              ))}
              {!buffers.length && 'No buffers found'}
            </div>
          )}
        </div>

        <LinkButton
          className="flex items-center text-primary-light"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? 'Less Options' : 'More Options'}
          <ChevronDownIcon
            className={`default-transition h-5 w-5 ml-1 ${
              showOptions ? 'transform rotate-180' : 'transform rotate-360'
            }`}
          />
        </LinkButton>
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
      </div>
      <Button
        className="mt-6"
        onClick={handlePropose}
        isLoading={isLoading}
        disabled={isLoading || !buffers.length}
      >
        <div>Propose Close {buffers.length > 1 ? 'Buffers' : 'Buffer'}</div>
      </Button>
    </>
  )
}

export default CloseBuffers
