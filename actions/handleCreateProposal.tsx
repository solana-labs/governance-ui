import { RpcContext } from '@models/core/api'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import { PublicKey } from '@solana/web3.js'
import { createProposal } from './createProposal'

export const handlePropose = async ({
  getInstruction,
  form,
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

  const instruction = await getInstruction()

  console.log('calling handle common', instruction)

  if (instruction.isValid) {
    console.log('calling handle valid')
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

    const instructionData = {
      data: instruction.serializedInstruction
        ? getInstructionDataFromBase64(instruction.serializedInstruction)
        : null,
      holdUpTime: governance?.info?.config.minInstructionHoldUpTime,
      prerequisiteInstructions: instruction.prerequisiteInstructions || [],
    }

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
        [instructionData],
        false
      )

      callback({
        url: `/dao/${symbol}/proposal/${proposalAddress}`,
        error: null,
      })
    } catch (error) {
      callback({
        error,
        url: null,
      })
    }
  }

  setIsLoading(false)
}
