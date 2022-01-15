import React, { useEffect, useState } from 'react'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import TokenBalanceCard from '@components/TokenBalanceCard'
import Button, { SecondaryButton } from '@components/Button'
import Links from '@components/LinksCompactWrapper'
import useWalletStore from 'stores/useWalletStore'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import getIcon from '../GetProposalTypesIcons'
import useRealm from '@hooks/useRealm'
import { tooltipMessage } from '../TooltipMessages'

const StepOne = ({
  setSelectedType,
  setSelectedStep,
}: {
  handleSetInstructions: any
  setSelectedType: any
  setSelectedStep: any
}) => {
  const connected = useWalletStore((s) => s.connected)
  const { realm } = useRealm()

  const [visibleInstructions, setVisibleInstructions] = useState<
    {
      id: Instructions
      name: string
      isVisible: boolean | undefined
      icon: string
    }[]
  >([])

  const {
    treasuryPaymentTooltip,
    addNewMemberTooltip,
    programUpgradeTooltip,
    mintTokensTooltip,
  } = tooltipMessage()

  const { availableInstructions } = useGovernanceAssets()

  const goToStepTwo = ({ value, index }) => {
    setSelectedType({
      value,
      index,
    })

    setSelectedStep(1)
  }

  useEffect(() => {
    setVisibleInstructions(availableInstructions)
  }, [realm])

  const genericTooltip = !connected ? 'Connect your wallet first' : ''

  return (
    <>
      <div className="w-full flex flex-col gap-y-5 mb-20 justify-start items-start max-w-md rounded-xl">
        {visibleInstructions &&
          visibleInstructions.map((instruction, index) => {
            if (instruction.isVisible) {
              if (
                instruction.id !== Instructions.None &&
                instruction.id !== Instructions.Base64
              ) {
                return (
                  <Button
                    key={instruction.id}
                    onClick={() =>
                      goToStepTwo({
                        value: instruction.id,
                        index,
                      })
                    }
                    disabled={!connected}
                    tooltipMessage={genericTooltip}
                    className="flex justify-center items-center h-10 w-full"
                  >
                    <div className="flex justify-center items-center gap-x-3">
                      {getIcon({
                        icon: instruction.icon,
                        treasuryPaymentTooltip,
                        addNewMemberTooltip,
                        programUpgradeTooltip,
                        mintTokensTooltip,
                      })}

                      <span>{instruction.name}</span>
                    </div>
                  </Button>
                )
              }

              if (instruction.id == Instructions.None) {
                return (
                  <SecondaryButton
                    key={instruction.id}
                    onClick={() =>
                      goToStepTwo({
                        value: instruction.id,
                        index,
                      })
                    }
                    disabled={!connected}
                    className="w-full h-10 flex justify-center items-center gap-x-3"
                  >
                    <div className="flex justify-center items-center gap-x-3">
                      {getIcon({
                        icon: instruction.icon,
                        treasuryPaymentTooltip,
                        addNewMemberTooltip,
                        programUpgradeTooltip,
                        mintTokensTooltip,
                      })}

                      <span>Custom instruction</span>
                    </div>
                  </SecondaryButton>
                )
              }
            }
          })}
      </div>

      <div className="md:max-w-xs w-full">
        <TokenBalanceCard />

        <Links />
      </div>
    </>
  )
}

export default StepOne
