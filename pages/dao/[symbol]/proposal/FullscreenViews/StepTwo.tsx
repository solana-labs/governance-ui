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
  selectedType,
  setDataCreation,
  setSelectedStep,
  governance,
  setGovernance,
  // handleGetInstructions
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

  // const instructions = handleGetInstructions();

  const getCurrentInstruction = ({ typeId, idx }) => {
    switch (typeId) {
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
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
            callback={callback}
          />
        )
      case Instructions.Mint:
        return (
          <MintTokens
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
            callback={callback}
          />
        )
      case Instructions.Base64 || Instructions.None:
        return (
          <CustomInstruction
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
            callback={callback}
          />
        )
      case Instructions.MangoMakeChangeMaxAccounts:
        return (
          <MakeChangeMaxAccounts
            callback={callback}
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
          />
        )
      case Instructions.AddMemberForm:
        return <AddMemberForm close={null} callback={callback} />
      default:
        null
    }
  }

  return (
    <>
      <div className="w-full">
        {getCurrentInstruction({
          typeId: selectedType.idx,
          idx: selectedType.idx,
        })}
      </div>
    </>
  )
}

export default StepTwo
