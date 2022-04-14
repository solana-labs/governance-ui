import KickstartSolana from '../../components_2/KickstartSolana'
import SolanaPerks from '../../components_2/SolanaPerks'
import DaoTypes from '../../components_2/DaoTypes'
import RealmsOptions from '../../components_2/RealmsOptions'
import SplGov from '../../components_2/SplGov'
import DaoCommunity from '../../components_2/DaoCommunity'
import Footer from '../../components_2/Footer'

const Solana = () => {
  return (
    <div>
      <KickstartSolana />
      <SolanaPerks />
      <DaoTypes />
      <RealmsOptions />
      <div className="px-56">
        <SplGov />
      </div>
      <DaoCommunity />
      <Footer />
    </div>
  )
}

export default Solana
