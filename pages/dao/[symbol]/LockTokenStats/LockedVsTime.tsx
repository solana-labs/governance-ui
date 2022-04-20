// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/line
import { ResponsiveLine } from '@nivo/line'

const LockedVsTime = ({ data, fmtMangoAmount /* see data tab */ }) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 25, right: 25, bottom: 25, left: 70 }}
    xScale={{ type: 'point' }}
    yScale={{
      type: 'linear',
      min: 'auto',
      max: 'auto',
      stacked: true,
      reverse: false,
    }}
    colors={{ scheme: 'greys' }}
    pointColor={{ theme: 'background' }}
    pointLabelYOffset={-12}
    axisLeft={{ format: (v) => fmtMangoAmount(v) }}
    isInteractive={false}
    enableGridX={false}
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
  />
)

export default LockedVsTime
