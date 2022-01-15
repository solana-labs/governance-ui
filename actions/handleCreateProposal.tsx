import { RpcContext } from '@models/core/api'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import { PublicKey } from '@solana/web3.js'
import { getTimestampFromDays } from '@tools/sdk/units'
import { formValidation, isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { createProposal } from './createProposal'

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

  const instructions: UiInstruction[] = await getInstruction()

  console.log('calling handle common', instructions)

  const { isValid }: formValidation = await isFormValid(schema, form)

  if (isValid && instructions.every((x) => x.isValid)) {
    const selectedGovernance = await getSelectedGovernance()

    let proposalAddress: PublicKey | null = null

    console.log('after proposal address')

    if (!realm) {
      setIsLoading(false)

      throw new Error('No realm selected')
    }

    console.log('govern', selectedGovernance)

    const rpcContext = new RpcContext(
      new PublicKey(realm.account.owner.toString()),
      realmInfo?.programVersion,
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
          : selectedGovernance?.info?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: x.prerequisiteInstructions || [],
      }
    })

    try {
      const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
        governance.info.config
      )

      const defaultProposalMint = !mint?.supply.isZero()
        ? realm.info.communityMint
        : !councilMint?.supply.isZero()
        ? realm.info.config.councilMint
        : undefined

      const proposalMint =
        canChooseWhoVote && form.voteByCouncil
          ? realm.info.config.councilMint
          : defaultProposalMint

      if (!proposalMint) {
        throw new Error('There is no suitable governing token for the proposal')
      }

      proposalAddress = await createProposal(
        rpcContext,
        realm.pubkey,
        selectedGovernance.pubkey,
        ownTokenRecord.pubkey,
        form.title ? form.title : `Add proposal to ${symbol}`,
        form.description ? form.description : '',
        proposalMint,
        selectedGovernance?.info?.proposalCount,
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
