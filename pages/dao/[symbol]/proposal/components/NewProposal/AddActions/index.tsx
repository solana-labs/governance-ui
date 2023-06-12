import Idea from '@carbon/icons-react/lib/Idea'

import { SectionBlock } from '@components/core/SectionBlock'
import { SectionHeader } from '@components/core/SectionHeader'
import { ValueBlock } from '@components/core/ValueBlock'
// import { FormProps } from '@hub/types/FormProps'
// import { durationStr } from '@components/treasuryV2/Details/WalletDetails/Info/Rules'
// import * as RE from '@utils/uiTypes/Result'
// import useTreasuryInfo from '@hooks/useTreasuryInfo'

interface Props {
  className?: string
  //   programVersion: number
}

export function AddActions(props: Props) {
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
      <SectionHeader className="mb-8" icon={<Idea />} text="Add actions" />

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
    </SectionBlock>
  )
}
