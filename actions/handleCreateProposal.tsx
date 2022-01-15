import {
  RpcContext,
  getInstructionDataFromBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { getTimestampFromDays } from '@tools/sdk/units'
import { formValidation, isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { createProposal } from './createProposal'
import { getProgramVersionForRealm } from '@models/registry/api'

export const handlePropose = async ({
  getInstruction,
  form,
  schema,
  governance,
  connection,
  callback,
  realmData,
  wallet,
  getSelectedGovernance,
  setIsLoading,
}) => {
  const {
    realmInfo,
    canChooseWhoVote,
    councilMint,
    realm,
    ownVoterWeight,
    mint,
    symbol,
  } = realmData

  setIsLoading(true)

  console.log('form', form)

  const instructions: UiInstruction[] = await getInstruction()

  console.log('calling handle common', instructions)

  const { isValid }: formValidation = await isFormValid(schema, form)

  if (isValid && instructions.every((x) => x.isValid)) {
    const selectedGovernance = await getSelectedGovernance()

    let proposalAddress: PublicKey | null = null

    if (!realm) {
      setIsLoading(false)

      throw new Error('No realm selected')
    }

    const rpcContext = new RpcContext(
      new PublicKey(realm.owner.toString()),
      getProgramVersionForRealm(realmInfo!),
      wallet,
      connection.current,
      connection.endpoint
    )

    const instructionsData = instructions.map((x) => {
      return {
        data: x.serializedInstruction
          ? getInstructionDataFromBase64(x.serializedInstruction)
          : null,
        holdUpTime: x.customHoldUpTime
          ? getTimestampFromDays(x.customHoldUpTime)
          : governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: x.prerequisiteInstructions || [],
      }
    })

    console.log('instructions data', instructionsData)

    try {
      console.log('ytycathc')
      const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
        governance.account.config
      )

      console.log('own token record', councilMint)

      const defaultProposalMint = !mint?.supply.isZero()
        ? realm.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm.account.config.councilMint
        : undefined

      const proposalMint =
        canChooseWhoVote && form.voteByCouncil
          ? realm.account.config.councilMint
          : defaultProposalMint

      if (!proposalMint) {
        throw new Error('There is no suitable governing token for the proposal')
      }

      proposalAddress = await createProposal(
        rpcContext,
        realm.pubkey,
        selectedGovernance.pubkey,
        ownTokenRecord.pubkey,
        form.title ? form.title : 'Proposal',
        form.description ? form.description : '',
        proposalMint,
        selectedGovernance?.account.proposalCount,
        instructionsData,
        false
      )

      callback({
        url: `/dao/${symbol}/proposal/${proposalAddress}`,
        error: null,
      })
    } catch (error) {
      console.log(error)

      callback({
        error,
        url: null,
      })
    }
  }

  setIsLoading(false)
}
