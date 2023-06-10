import Idea from '@carbon/icons-react/lib/Idea'
import List from '@carbon/icons-react/lib/List'

import { SectionBlock } from '../SectionBlock'
import { SectionHeader } from '../SectionHeader'
import { ValueBlock } from '../ValueBlock'
import { Dispatch, SetStateAction, cloneElement } from 'react'
import cx from '@hub/lib/cx'
import { ButtonToggle } from '../../controls/ButtonToggle'
// import { FormProps } from '@hub/types/FormProps'
// import { durationStr } from '@components/treasuryV2/Details/WalletDetails/Info/Rules'
// import * as RE from '@utils/uiTypes/Result'
// import useTreasuryInfo from '@hooks/useTreasuryInfo'

interface Props {
  className?: string
  setIsOnChainProposal: Dispatch<SetStateAction<boolean>>
  isOnChainProposal: boolean
  //   programVersion: number
}

export function ProposalType(props: Props) {
  // 0 is executable, 1 is non-executable
  // const treasuryInfo = useTreasuryInfo(false)

  //   const walletInfo = RE.isOk(treasuryInfo)
  //     ? treasuryInfo.data.wallets.find(
  //         (wallet) =>
  //           wallet.governanceAddress === value?.governance.pubkey.toBase58()
  //       )
  //     : null

  return (
    <SectionBlock className={props.className}>
      <SectionHeader className="mb-8" icon={<Idea />} text="Proposal Type" />
      <div className="bg-green text-black w-fit p-1 rounded-sm">
        {cloneElement(<List />, {
          className: cx('list', 'fill-current', 'h-4', 'w-4'),
        })}
        New: Multiple Choice Polls
      </div>
      <ValueBlock
        description="Now, in addition to creating a proposal with simple choices, you may create polls with several voting options. Note that these multiple choice polls cannot have actions and are therefore non-executable."
        title=""
        descriptionStyle="light"
      >
        {/* <Select /> */}

        {/* <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
          <SliderValue
            min={1}
            max={7}
            value={props.maxVoteDays}
            units={ntext(props.maxVoteDays, 'Day')}
            onChange={props.onMaxVoteDaysChange}
          />
          <Slider
            min={1}
            max={7}
            value={props.maxVoteDays}
            onChange={props.onMaxVoteDaysChange}
          />
        </div> */}
      </ValueBlock>

      <ValueBlock description="" title="What type of proposal are you creating">
        <ButtonToggle
          className="h-14"
          valueTrueText="Executable (on-chain)"
          valueFalseText="Multiple Choice Poll (off-chain)"
          value={props.isOnChainProposal}
          onChange={(value) => {
            console.log('Chaning... ', value)
            props.setIsOnChainProposal(value)
          }}
        />
      </ValueBlock>
    </SectionBlock>
  )
}
