import Idea from '@carbon/icons-react/lib/Idea'
import AddIcon from '@carbon/icons-react/lib/Add'
import { SectionBlock } from '../SectionBlock'
import { SectionHeader } from '../SectionHeader'
import { ValueBlock } from '../ValueBlock'
import { Primary } from '../../controls/button/Primary'
// import { FormProps } from '@hub/types/FormProps'
// import { durationStr } from '@components/treasuryV2/Details/WalletDetails/Info/Rules'
// import * as RE from '@utils/uiTypes/Result'
// import useTreasuryInfo from '@hooks/useTreasuryInfo'

interface Props {
  className?: string
  //   programVersion: number
}

export function AddVotingChoices(props: Props) {
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
      <SectionHeader
        className="mb-8"
        icon={<Idea />}
        text="Add voting choices"
      />

      <ValueBlock
        description="Actions are the building blocks to creating an automatically executable smart contract in Realms. If a proposal is approved, its instructions will be executed based on the actions inputted."
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

      <Primary className="w-full">
        <AddIcon className="w-4 h-4 mr-1" />
        Add another voting choice
      </Primary>
    </SectionBlock>
  )
}
