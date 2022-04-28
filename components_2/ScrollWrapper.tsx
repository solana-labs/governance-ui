import Status from './Status'
import KickstartSolana from './KickstartSolana'
import SolanaPerks from './SolanaPerks'
import DaoTypes from './DaoTypes'
import RealmsOptions from './RealmsOptions'
import SplGov from './SplGov'
import DaoCommunity from './DaoCommunity'
import RealmsMetrics from './RealmsMetrics'
import SocialChannels from './SocialChannels'
import FreequentlyAskedQuestions from './FreequentlyAskedQuestions'
import Footer from './Footer'
import { AltNavbar } from './NavBar'
type Props = {
  children: React.ReactNode
  inView: boolean
}

/**
 * ScrollWrapper directs the user to scroll the page to reveal it's children.
 * Use this on Modules that have scroll and/or observer triggers.
 */
const ScrollWrapper = ({ children, inView, ...props }: Props) => {
  return (
    <>
      <img
        src="/1-Landing-v2/landing-hero-desktop.png"
        className="absolute top-0 left-0 z-[-10] bg-gray-800 pb-10"
      />
      <AltNavbar />
      <div {...props}>
        {/* <Status inView={inView} /> */}
        <section>
          <KickstartSolana />
        </section>
        {children}
        <section>
          <SolanaPerks />
          <DaoTypes />
          <RealmsOptions />
          <div className="px-56">
            <SplGov />
          </div>
          <DaoCommunity />
          <RealmsMetrics />
          <div className="px-32">
            <SocialChannels />
          </div>
          <FreequentlyAskedQuestions />
          <Footer />
        </section>
      </div>
    </>
  )
}

export default ScrollWrapper
