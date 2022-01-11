import React from 'react'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import TokenBalanceCard from '@components/TokenBalanceCard'
import Button, { SecondaryButton } from '@components/Button'
import { CodeIcon } from '@heroicons/react/outline'
import AddMemberIcon from '@components/AddMemberIcon'
import Links from '@components/LinksCompactWrapper'
import MangoMakeIcon from '@components/MangoMakeIcon'
import MintTokensIcon from '@components/MintTokensIcon'
import ProgramUpgradeIcon from '@components/ProgramUpgradeIcon'
import TreasuryPaymentIcon from '@components/TreasuryPaymentIcon'
import useWalletStore from 'stores/useWalletStore'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { tooltipMessage } from '../TooltipMessages'

const StepOne = ({
  handleSetInstructions,
  setSelectedType,
  setSelectedStep,
}: {
  handleSetInstructions: any
  setSelectedType: any
  setSelectedStep: any
}) => {
  const connected = useWalletStore((s) => s.connected)

  const {
    treasuryPaymentTooltip,
    addNewMemberTooltip,
    programUpgradeTooltip,
    mintTokensTooltip,
  } = tooltipMessage()

  const {
    canUseProgramUpgradeInstruction,
    canMintRealmCommunityToken,
    canUseMintInstruction,
    canUseTransferInstruction,
  } = useGovernanceAssets()

  const goToStepTwo = ({ value, idx }) => {
    const newInstruction = {
      type: value,
    }

    setSelectedType({
      value,
      idx,
    })

    setSelectedStep(1)

    handleSetInstructions(newInstruction, idx)
  }

  return (
    <>
      <div className="w-full flex flex-col gap-y-5 mb-20 justify-start items-start max-w-md rounded-xl">
        {canUseTransferInstruction && (
          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Transfer Tokens',
                idx: Instructions.Transfer,
              })
            }
            disabled={treasuryPaymentTooltip !== ''}
            tooltipMessage={treasuryPaymentTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <TreasuryPaymentIcon
                className={`${
                  treasuryPaymentTooltip !== '' && 'opacity-50'
                } w-8`}
                color={`${treasuryPaymentTooltip !== '' ? '#FFF' : '#000'}`}
              />

              <span>Treasury payment</span>
            </div>
          </Button>
        )}

        {canMintRealmCommunityToken() && (
          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Add Member',
                idx: Instructions.AddMemberForm,
              })
            }
            disabled={addNewMemberTooltip !== ''}
            tooltipMessage={addNewMemberTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <AddMemberIcon
                className="w-6"
                color={`${addNewMemberTooltip !== '' ? '#FFF' : '#000'}`}
              />

              <span>Add new member</span>
            </div>
          </Button>
        )}

        {canUseProgramUpgradeInstruction && (
          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Program Upgrade',
                idx: Instructions.ProgramUpgrade,
              })
            }
            disabled={programUpgradeTooltip !== ''}
            tooltipMessage={programUpgradeTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <ProgramUpgradeIcon
                className="w-6"
                color={`${programUpgradeTooltip !== '' ? '#FFF' : '#000'}`}
              />

              <span>Upgrade a program</span>
            </div>
          </Button>
        )}

        {canUseMintInstruction && (
          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Mint Tokens',
                idx: Instructions.Mint,
              })
            }
            disabled={mintTokensTooltip !== ''}
            tooltipMessage={mintTokensTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <MintTokensIcon
                className="w-6"
                color={`${mintTokensTooltip !== '' ? '#FFF' : '#000'}`}
              />

              <span>Mint tokens</span>
            </div>
          </Button>
        )}

        <Button
          onClick={() =>
            goToStepTwo({
              value: 'Mango',
              idx: Instructions.MangoMakeChangeMaxAccounts,
            })
          }
          disabled={mintTokensTooltip !== ''}
          tooltipMessage={mintTokensTooltip}
          className="flex justify-center items-center h-10 w-full"
        >
          <div className="flex justify-center items-center gap-x-3">
            <MangoMakeIcon
              className="w-6"
              color={`${mintTokensTooltip !== '' ? '#FFF' : '#000'}`}
            />

            <span>Mango - Change max accounts</span>
          </div>
        </Button>

        <SecondaryButton
          onClick={() =>
            goToStepTwo({
              value: 'Mint Tokens',
              idx: Instructions.Base64,
            })
          }
          disabled={!connected}
          className="w-full h-10 flex justify-center items-center gap-x-3"
        >
          <div className="flex justify-center items-center gap-x-3">
            <CodeIcon
              className="w-6"
              color={`${mintTokensTooltip !== '' ? '#FFF' : '#E1CE7A'}`}
            />

            <span>Custom instruction</span>
          </div>
        </SecondaryButton>
      </div>

      <div className="md:max-w-xs w-full">
        <TokenBalanceCard />

        <Links />
      </div>
    </>
  )
}

export default StepOne
