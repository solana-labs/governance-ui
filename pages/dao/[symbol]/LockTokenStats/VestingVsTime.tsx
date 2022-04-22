import { ResponsiveBar } from '@nivo/bar'

const VestingVsTime = ({ data, fmtMangoAmount /* see data tab */ }) => (
  <ResponsiveBar
    data={data}
    keys={['amount']}
    indexBy="month"
    margin={{ top: 10, right: 25, bottom: 25, left: 85 }}
    padding={0.3}
    valueScale={{ type: 'linear' }}
    indexScale={{ type: 'band', round: true }}
    isInteractive={false}
    borderRadius={4}
    theme={{
      axis: {
        ticks: {
          line: {
            stroke: 'var(--fgd-3)',
          },
          text: {
            fill: 'var(--fgd-3)',
          },
        },
      },
    }}
    colors={() => '#A4ACB7'}
    label={(v) => fmtMangoAmount(v.value)}
    axisLeft={{ format: (v) => fmtMangoAmount(v) }}
    labelSkipWidth={12}
    labelSkipHeight={12}
    labelTextColor="black"
    role="application"
  />
)
export default VestingVsTime
