/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ProgramAccount,
  Governance,
  getGovernanceProgramVersion,
  SYSTEM_PROGRAM_ID,
  VoteKind,
  VoteChoice,
  Vote,
  withCastVote,
  serializeInstructionToBase64,
  getProposal,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { AssetAccount } from '@utils/uiTypes/assets'
import Select from '@components/inputs/Select'
import { isFormValid } from '@utils/formValidation'
import * as yup from 'yup'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { DEFAULT_VSR_ID, VsrClient } from 'VoteStakeRegistry/sdk/client'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'

type DualFinanceVoteForm = {
  realm: string
  delegateToken: AssetAccount | undefined
  proposal: string
  governanceProgram: string
  voteOption: 'Yes' | 'No'
}

const DualVote = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceVoteForm>({
    realm: 'EGYbpow8V9gt8JFmadFYai4sjfwc7Vc9gazU735hE6u7',
    governanceProgram: 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
    proposal: '',
    voteOption: 'Yes',
    delegateToken: undefined,
  })
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { assetAccounts } = useGovernanceAssets()
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const schema = useMemo(
    () =>
      yup.object().shape({
        delegateToken: yup
          .object()
          .nullable()
          .required('Program governed account is required'),
        realm: yup.string().required(),
        proposal: yup.string().required(),
        voteOption: yup.string().required(),
      }),
    []
  )
  const validateInstruction = useCallback(async () => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }, [form, schema])

  useEffect(() => {
    async function getInstruction(): Promise<UiInstruction> {
      const isValid = await validateInstruction()
      let serializedInstruction = ''
      const signers: Keypair[] = []
      const instructions: TransactionInstruction[] = []
      if (
        isValid &&
        form.delegateToken?.governance?.account &&
        wallet?.publicKey
      ) {
        const DUAL_MINT = new PublicKey(
          'DUALa4FC2yREwZ59PHeu1un4wis36vHRv5hWVBmzykCJ'
        )
        const programId = new PublicKey(form.governanceProgram)
        const walletPk = form.delegateToken.governance.nativeTreasuryAddress
        const payer = form.delegateToken.governance.nativeTreasuryAddress
        const tokenOwnerRecord = await getTokenOwnerRecordAddress(
          programId,
          new PublicKey(form.realm),
          DUAL_MINT,
          walletPk
        )

        const options = AnchorProvider.defaultOptions()
        const provider = new AnchorProvider(
          connection.current,
          new EmptyWallet(Keypair.generate()),
          options
        )
        const proposal = await getProposal(
          connection.current,
          new PublicKey(form.proposal)
        )
        const vsrClient = await VsrClient.connect(provider, DEFAULT_VSR_ID)
        // Explicitly request the version before making RPC calls to work around race conditions in resolving
        // the version for RealmInfo
        const programVersion = await getGovernanceProgramVersion(
          connection.current,
          programId
        )

        const { registrar } = await getRegistrarPDA(
          new PublicKey(form.realm),
          DUAL_MINT,
          DEFAULT_VSR_ID
        )
        const { voter } = await getVoterPDA(registrar, walletPk, DEFAULT_VSR_ID)
        const { voterWeightPk } = await getVoterWeightPDA(
          registrar,
          walletPk,
          DEFAULT_VSR_ID
        )

        const updateVoterWeightRecordIx = await vsrClient!.program.methods
          .updateVoterWeightRecord()
          .accounts({
            registrar,
            voter,
            voterWeightRecord: voterWeightPk,
            systemProgram: SYSTEM_PROGRAM_ID,
          })
          .instruction()

        instructions.push(updateVoterWeightRecordIx)

        const vote =
          form.voteOption === 'Yes'
            ? new Vote({
                voteType: VoteKind.Approve,
                approveChoices: [
                  new VoteChoice({ rank: 0, weightPercentage: 100 }),
                ],
                deny: undefined,
                veto: undefined,
              })
            : new Vote({
                voteType: VoteKind.Deny,
                approveChoices: undefined,
                deny: true,
                veto: undefined,
              })

        const tokenMint = DUAL_MINT

        await withCastVote(
          instructions,
          programId,
          programVersion,
          new PublicKey(form.realm),
          proposal.account.governance,
          proposal.pubkey,
          proposal.account.tokenOwnerRecord,
          tokenOwnerRecord,
          walletPk,
          tokenMint,
          vote,
          payer,
          voterWeightPk,
          undefined
        )

        serializedInstruction = ''
      }
      const obj: UiInstruction = {
        signers: signers,
        additionalSerializedInstructions: instructions.map((x) =>
          serializeInstructionToBase64(x)
        ),
        serializedInstruction: serializedInstruction,
        isValid,
        governance: form.delegateToken?.governance,
      }
      return obj
    }
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [
    form,
    governedAccount,
    handleSetInstructions,
    index,
    connection,
    wallet,
    validateInstruction,
  ])

  useEffect(() => {
    setGovernedAccount(form.delegateToken?.governance)
  }, [form.delegateToken])

  // TODO: Include this in the config instruction which can optionally be done
  // if the project doesnt need to change where the tokens get returned to.
  return (
    <>
      <Input
        label="Realm"
        value={form.realm}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'realm',
          })
        }
        error={formErrors['realm']}
      />
      <Input
        label="Proposal Pk"
        value={form.proposal}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'proposal',
          })
        }
        error={formErrors['realm']}
      />
      <Select
        className="break-all"
        label="Vote option"
        onChange={(opt) =>
          handleSetForm({
            value: opt,
            propertyName: 'voteOption',
          })
        }
        placeholder="Please select..."
        value={form.voteOption}
      >
        <Select.Option value={'Yes'}>Yes</Select.Option>
        <Select.Option value={'No'}>No</Select.Option>
      </Select>
      <Tooltip content="Token to be delegated.">
        <GovernedAccountSelect
          label="Delegate Token"
          governedAccounts={assetAccounts.filter((x) => x.isSol)}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'delegateToken' })
          }}
          value={form.delegateToken}
          error={formErrors['delegateToken']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
          type="token"
        ></GovernedAccountSelect>
      </Tooltip>
    </>
  )
}

export default DualVote
