import AddMemberForm from '@components/Members/AddMemberForm'
import useQueryContext from '@hooks/useQueryContext'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import React from 'react'
import CustomInstruction from './CustomInstruction'
import MakeChangeMaxAccounts from './MakeChangeMaxAccounts'
import MintTokens from './MintTokens'
import ProgramUpgrade from './ProgramUpgrade'
import TreasuryPaymentFormFullScreen from './TreasuryPaymentForm'

const StepTwo = ({
  setDataCreation,
  setSelectedStep,
  selectedType,
  governance,
  setGovernance,
}) => {
  const { fmtUrlWithCluster } = useQueryContext()

  const callback = ({ url, error }) => {
    let newAddressURL = null

    if (url) {
      newAddressURL = fmtUrlWithCluster(url)
    }

    goToStepThree({
      url: newAddressURL,
      error,
    })
  }

  const goToStepThree = (data?: any) => {
    setDataCreation(data)
    setSelectedStep(2)
  }

  const getCurrentInstruction = ({ selectedType, idx }) => {
    switch (selectedType) {
      case Instructions.Transfer:
        return (
          <TreasuryPaymentFormFullScreen
            index={idx}
            governance={governance}
            setGovernance={setGovernance}
            callback={callback}
          />
        )
      case Instructions.ProgramUpgrade:
        return (
          <ProgramUpgrade
            index={idx}
            setGovernance={setGovernance}
            governance={governance}
            callback={callback}
          />
        )
      case Instructions.Mint:
        return (
          <MintTokens
            index={idx}
            setGovernance={setGovernance}
            governance={governance}
            callback={callback}
          />
        )
      case Instructions.Base64 || Instructions.None:
        return (
          <CustomInstruction
            index={idx}
            setGovernance={setGovernance}
            governance={governance}
            callback={callback}
          />
        )
      case Instructions.MangoMakeChangeMaxAccounts:
        return (
          <MakeChangeMaxAccounts
            index={idx}
            callback={callback}
            setGovernance={setGovernance}
            governance={governance}
          />
        )
      case Instructions.AddMemberForm:
        return <AddMemberForm close={null} callback={callback} />
      default:
        return (
          <CustomInstruction
            index={idx}
            setGovernance={setGovernance}
            governance={governance}
            callback={callback}
          />
        )
    }
  }

  return (
    <>
      {getCurrentInstruction({
        selectedType: selectedType.value,
        idx: selectedType.idx,
      })}
    </>
  )
}

export default StepTwo
