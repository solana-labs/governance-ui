import Idea from '@carbon/icons-react/lib/Idea'
import AddIcon from '@carbon/icons-react/lib/Add'
import { SectionBlock } from '@components/core/SectionBlock'
import { SectionHeader } from '@components/core/SectionHeader'
import { Primary } from '@components/core/controls/Button/Primary'
import { MultipleChoiceOptionForm } from '../MultipleChoiceOptionForm'
import { useState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
// import { FormProps } from '@hub/types/FormProps'
// import { durationStr } from '@components/treasuryV2/Details/WalletDetails/Info/Rules'
// import * as RE from '@utils/uiTypes/Result'
// import useTreasuryInfo from '@hooks/useTreasuryInfo'

interface Props {
  className?: string
  //   programVersion: number
}

export function AddVotingChoices(props: Props) {
  const [choices, setChoices] = useState<string[]>([''])
  // 0 is executable, 1 is non-executable
  // const treasuryInfo = useTreasuryInfo(false)

  //   const walletInfo = RE.isOk(treasuryInfo)
  //     ? treasuryInfo.data.wallets.find(
  //         (wallet) =>
  //           wallet.governanceAddress === value?.governance.pubkey.toBase58()
  //       )
  //     : null

  console.log(choices)

  function setChoice(index: number, choice: string) {
    setChoices((prevChoices) => {
      const newChoices = [...prevChoices]
      newChoices[index] = choice
      return newChoices
    })
  }

  const addChoice = () => {
    setChoices([...choices, ''])
    console.log(choices)
  }

  const removeChoice = (idx: number) => {
    setChoices([...choices.filter((x, index) => index !== idx)])
  }

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<Idea />}
        text="Add voting choices"
      />

      {choices.map((choice, idx) => {
        return (
          <MultipleChoiceOptionForm
            key={idx}
            choice={choice}
            setChoice={setChoice}
            index={idx}
            className="mb-4"
            removeChoice={removeChoice}
          ></MultipleChoiceOptionForm>
        )
      })}

      <Primary onClick={addChoice} className="w-full">
        <AddIcon className="w-4 h-4 mr-1" />
        Add another voting choice
      </Primary>
      <div className="flex items-center mt-8">
        <ExclamationCircleIcon className="h-9 w-9 text-neutral-500"></ExclamationCircleIcon>
        <div className="text-neutral-500 text-xs ml-3">
          For all proposals, Realms auto-generates a voting option for “none of
          the above”, which will display below the last option added by the
          proposal creator.
        </div>
      </div>
    </SectionBlock>
  )
}
