import { ResponsiveBar } from '@nivo/bar'

const VestingVsTime = ({ data, fmtMangoAmount /* see data tab */ }) => (
  <ResponsiveBar
    data={data}
    keys={['amount']}
    indexBy="month"
    margin={{ top: 10, right: 25, bottom: 25, left: 80 }}
    padding={0.3}
    valueScale={{ type: 'linear' }}
    indexScale={{ type: 'band', round: true }}
    colors={{ scheme: 'greys' }}
    isInteractive={false}
    theme={{
      axis: {
        ticks: {
          line: {
            stroke: '#555555',
          },
          text: {
            fill: '#FFFFFF',
          },
        },
        legend: {
          text: {
            fill: '#aaaaaa',
          },
        },
      },
    }}
    label={(v) => fmtMangoAmount(v.value)}
    axisLeft={{ format: (v) => fmtMangoAmount(v) }}
    labelSkipWidth={12}
    labelSkipHeight={12}
    labelTextColor="black"
    role="application"
  />
)
export default VestingVsTime
