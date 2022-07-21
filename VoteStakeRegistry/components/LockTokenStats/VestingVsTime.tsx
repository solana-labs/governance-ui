import { ResponsiveBar } from '@nivo/bar'

const VestingVsTime = ({ data, fmtAmount /* see data tab */ }) => (
  <ResponsiveBar
    data={data}
    keys={['amount']}
    indexBy="month"
    margin={{ bottom: 40, left: 56, right: 24 }}
    padding={0.3}
    valueScale={{ type: 'linear' }}
    indexScale={{ type: 'band', round: true }}
    isInteractive={false}
    borderRadius={4}
    theme={{
      axis: {
        ticks: {
          line: {
            stroke: 'var(--bkg-2)',
          },
          text: {
            fill: 'var(--fgd-3)',
          },
        },
      },
      grid: {
        line: { stroke: 'var(--bkg-4)' },
      },
    }}
    defs={[
      {
        id: 'gradient',
        type: 'linearGradient',
        colors: [
          { offset: 0, color: 'var(--secondary-2-light)' },
          { offset: 20, color: 'var(--secondary-2-dark)' },
          { offset: 100, color: 'var(--bkg-2)' },
        ],
      },
    ]}
    fill={[{ match: '*', id: 'gradient' }]}
    label={(v) => fmtAmount(v.value)}
    axisLeft={{ format: (v) => fmtAmount(v) }}
    labelSkipWidth={12}
    labelSkipHeight={12}
    labelTextColor="#fff"
    role="application"
  />
)
export default VestingVsTime
