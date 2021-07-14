import ContributionPage from './ContributionPage'
import RedeemPage from './RedeemPage'
import Notifications from '../components/Notification'
import Button, {
  ButtonWithChevronRight,
  PrimaryButton,
} from '../components/Button'
import Link from '../components/Link'
import TopBar from '../components/TopBar'

import usePool from '../hooks/usePool'

const Index = () => {
  const { endIdo } = usePool()

  return (
    <div className={`bg-bkg-1 text-fgd-1 transition-all`}>
      <TopBar />
      <div>
        <div>
          <PrimaryButton>Primary</PrimaryButton>
        </div>
        <div>
          <Button disabled>Disabled</Button>
        </div>
        <div>
          <Link>Link</Link>
        </div>
        <div>
          <Link disabled>Disabled</Link>
        </div>
      </div>
      <div>
        <div>
          <ButtonWithChevronRight>Primary</ButtonWithChevronRight>
        </div>
        <div>
          <ButtonWithChevronRight disabled>Disabled</ButtonWithChevronRight>
        </div>
        <div>
          <ButtonWithChevronRight secondary>Secondary</ButtonWithChevronRight>
        </div>
      </div>
      {/* <Notifications />
      {endIdo?.isAfter() && <ContributionPage />}
      {endIdo?.isBefore() && <RedeemPage />} */}
    </div>
  )
}

export default Index
