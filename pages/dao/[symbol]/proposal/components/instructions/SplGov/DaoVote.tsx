/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  ProgramAccount,
  Governance,
  SYSTEM_PROGRAM_ID,
  VoteKind,
  VoteChoice,
  Vote,
  withCastVote,
  serializeInstructionToBase64,
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
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'
import { fetchProgramVersion } from '@hooks/queries/useProgramVersionQuery'
import { fetchProposalByPubkeyQuery } from '@hooks/queries/proposal'
import { fetchGovernanceByPubkey } from '@hooks/queries/governance'
import { fetchRealmByPubkey } from '@hooks/queries/realm'
import { fetchRealmConfigQuery } from '@hooks/queries/realmConfig'
import { findPluginName } from '@constants/plugins'

type DaoVoteForm = {
  delegateToken: AssetAccount | undefined
  proposal: string
  voteOption: 'Yes' | 'No'
}
/* 
const getVotingClient = async (
  connection: Connection,
  realmPk: PublicKey,
  governingTokenMint: PublicKey,
  authority: PublicKey
) => {
  const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
  if (realm === undefined) {
    throw new Error('Realm not found')
  }

} */

const DaoVote = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DaoVoteForm>({
    proposal: '',
    voteOption: 'Yes',
    delegateToken: undefined,
  })
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { assetAccounts } = useGovernanceAssets()
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

  /* 
  const parsedProposalPk = tryParsePublicKey(form.proposal)
  const {
    data: proposalData,
    isLoading: proposalLoading,
  } = useProposalByPubkeyQuery(parsedProposalPk)
*/
  // TODO preview proposal title!

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
        const proposalPk = new PublicKey(form.proposal)

        const { result: proposal } = await fetchProposalByPubkeyQuery(
          connection.current,
          proposalPk
        )
        if (proposal === undefined) {
          throw new Error('Proposal not found')
        }
        const { result: proposalGovernance } = await fetchGovernanceByPubkey(
          connection.current,
          proposal.account.governance
        )
        if (proposalGovernance === undefined) {
          throw new Error('Governance not found')
        }
        const realmPk = proposalGovernance.account.realm
        const { result: realm } = await fetchRealmByPubkey(
          connection.current,
          realmPk
        )
        if (realm === undefined) {
          throw new Error('Realm not found')
        }
        const governingMint = proposal.account.governingTokenMint

        const programId = proposal.owner
        const walletPk = form.delegateToken.governance.nativeTreasuryAddress
        const payer = form.delegateToken.governance.nativeTreasuryAddress
        const tokenOwnerRecord = await getTokenOwnerRecordAddress(
          programId,
          realmPk,
          governingMint,
          walletPk
        )

        const options = AnchorProvider.defaultOptions()
        const provider = new AnchorProvider(
          connection.current,
          new EmptyWallet(Keypair.generate()),
          options
        )

        const { result: realmConfig } = await fetchRealmConfigQuery(
          connection.current,
          realmPk
        )
        const votingPop =
          governingMint.toString() === realm.account.communityMint.toString()
            ? 'community'
            : 'council'
        const pluginPk =
          votingPop === 'community'
            ? realmConfig?.account.communityTokenConfig.voterWeightAddin
            : realmConfig?.account.councilTokenConfig.voterWeightAddin
        const pluginName = findPluginName(pluginPk)

        // TODO this needs to just make a VotingClient and use it, for any plugin.
        // But that code doesn't exist because right now everything is done in stupid hook.
        // So currently only [vanilla and] VSR is supported
        let voterWeightPk: PublicKey | undefined = undefined
        if (pluginName === 'VSR') {
          if (pluginPk === undefined) throw new Error('should be impossible')
          const vsrClient = await VsrClient.connect(provider, pluginPk)
          // Explicitly request the version before making RPC calls to work around race conditions in resolving
          // the version for RealmInfo

          const { registrar } = getRegistrarPDA(
            realmPk,
            governingMint,
            pluginPk
          )
          const { voter } = getVoterPDA(registrar, walletPk, pluginPk)
          voterWeightPk = getVoterWeightPDA(registrar, walletPk, pluginPk)
            .voterWeightPk

          const updateVoterWeightRecordIx = await vsrClient.program.methods
            .updateVoterWeightRecord()
            .accounts({
              registrar,
              voter,
              voterWeightRecord: voterWeightPk,
              systemProgram: SYSTEM_PROGRAM_ID,
            })
            .instruction()

          instructions.push(updateVoterWeightRecordIx)
        }

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

        const tokenMint = governingMint

        const programVersion = await fetchProgramVersion(
          connection.current,
          programId
        )

        await withCastVote(
          instructions,
          programId,
          programVersion,
          realmPk,
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
      { governedAccount: form.delegateToken?.governance, getInstruction },
      index
    )
  }, [
    form,
    handleSetInstructions,
    index,
    connection,
    wallet,
    validateInstruction,
  ])

  // TODO: Include this in the config instruction which can optionally be done
  // if the project doesnt need to change where the tokens get returned to.
  return (
    <>
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
          governedAccounts={assetAccounts.filter((x) => x.isToken)}
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

export default DaoVote
