import GradientTitle from './GradientTitle'
import { MetricsBoxPlus, MetricsBoxDollar } from './MetricsBox'

const RealmsMetrics = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <GradientTitle>Key Metrics on Realms</GradientTitle>
        </div>

        <div className="w-full md:w-1/2 grow">
          <div className="grid grid-cols-2 gap-y-32">
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
