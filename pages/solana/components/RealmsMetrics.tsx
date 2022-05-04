import Gradient from '../../../components_2/Gradient'
import {
  MetricsBoxPlus,
  MetricsBoxDollar,
} from '../../../components_2/MetricsBox'

const RealmsMetrics = () => {
  return (
    <div className="pt-12 md:pt-32 pb-14 md:pb-36">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <Gradient>Key Metrics on Realms</Gradient>
        </div>

        <div className="w-full md:w-1/2 pt-7 md:pt-0">
          <div className="grid grid-cols-2 gap-14 md:gap-32">
            <MetricsBoxDollar
              symbol="$"
              numbers="31.8B"
              text="Total value locked"
            />
            <MetricsBoxPlus
              numbers="3.8K"
              symbol="+"
              text="Proposals created"
            />
            <MetricsBoxPlus
              numbers="289"
              symbol="+"
              text="DAOs created on Realms"
            />
            <MetricsBoxPlus numbers="23.7K" symbol="+" text="DAO members" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealmsMetrics
