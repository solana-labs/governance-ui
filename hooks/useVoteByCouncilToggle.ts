// The voteByCouncil toggle UI is avaiable on a number of views in Realms.
// Whether it is available, or enabled, is determined by the realm's config and the user's tokens.
// This hook encapsulates this logic
import { useEffect, useState } from 'react'
import { useRealmVoterWeights } from '@hooks/useRealmVoterWeightPlugins'
import BN from 'bn.js'
import { GovernanceRole } from '../@types/types'

const onlyGovernanceAvailable = (
  availableVoteGovernanceOptions: GovernanceRole[],
  role: GovernanceRole
) =>
  availableVoteGovernanceOptions.length === 1 &&
  availableVoteGovernanceOptions[0] === role

type UseVoteByCouncilToggleValue = {
  // Allow the UI to decide whether the toggle should be shown
  // False if there is only one option
  // NOTE: ignore this if you always want to show the toggle if the user has council tokens (even if they don't have community tokens)
  shouldShowVoteByCouncilToggle: boolean
  // The value of the UI toggle
  // True if this proposal should be voted by council
  voteByCouncil: boolean
  // Set the value of the UI toggle
  setVoteByCouncil: (value: boolean) => void
}

export const useVoteByCouncilToggle = (): UseVoteByCouncilToggleValue => {
  const { communityMaxWeight, councilMaxWeight } = useRealmVoterWeights()
  const availableVoteGovernanceOptions = [
    communityMaxWeight?.value?.gt(new BN(0)) ? 'community' : undefined,
    councilMaxWeight?.value?.gt(new BN(0)) ? 'council' : undefined,
  ].filter(Boolean) as GovernanceRole[] // filter out undefined
  const [voteByCouncil, setVoteByCouncil] = useState(false)

  // once availableVoteGovernanceOptions is available, we set the default vote level (if there is only one option)
  useEffect(() => {
    if (onlyGovernanceAvailable(availableVoteGovernanceOptions, 'council')) {
      setVoteByCouncil(true)
    } else if (
      onlyGovernanceAvailable(availableVoteGovernanceOptions, 'community')
    ) {
      setVoteByCouncil(false)
    }
  }, [availableVoteGovernanceOptions])

  // the proposal will use the council if:
  // - that is the only option
  // - the proposer chooses it
  const updateVoteByCouncilToggle = (value: boolean) => {
    // only set it to false if there is another option
    if (
      value ||
      !onlyGovernanceAvailable(availableVoteGovernanceOptions, 'council')
    ) {
      setVoteByCouncil(value)
    }
  }

  return {
    shouldShowVoteByCouncilToggle: availableVoteGovernanceOptions.length > 1,
    voteByCouncil,
    setVoteByCouncil: updateVoteByCouncilToggle,
  }
}
