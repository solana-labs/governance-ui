import { useEffect, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { HierarchyCircularNode } from 'd3'

import { VoterDisplayData, VoteType } from '@models/proposal'
import { abbreviateAddress } from '@utils/formatting'
import { getExplorerUrl } from '@components/explorer/tools'

const voteTypeDomain = (type: VoteType) => {
  switch (type) {
    case VoteType.No:
      return 'Nay'
    case VoteType.Undecided:
      return 'Undecided'
    case VoteType.Yes:
      return 'Yay'
  }
}

const loadD3 = () => import('d3')

type D3 = Awaited<ReturnType<typeof loadD3>>

interface Props {
  className?: string
  data: VoterDisplayData[]
  endpoint: string
  height: number
  maxNumBubbles: number
  highlighted?: string
  width: number
  onHighlight?(key?: string): void
}

function Content(props: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [d3, setD3] = useState<D3 | null>(null)

  useEffect(() => {
    loadD3().then(setD3)
  }, [])

  useEffect(() => {
    if (container.current && d3 && props.data.length) {
      container.current.innerHTML = ''

      const color = d3
        .scaleOrdinal()
        .domain([
          voteTypeDomain(VoteType.Undecided),
          voteTypeDomain(VoteType.Yes),
          voteTypeDomain(VoteType.No),
        ])
        .range(['rgb(82, 82, 82)', 'rgb(101, 163, 13)', 'rgb(159, 18, 57)'])

      const hierarchy = d3
        .hierarchy({ children: props.data })
        .sum((d: any) => (d.votesCast ? d.votesCast.toNumber() : 0))
        .sort((a, b) => (b.value || 0) - (a.value || 0))

      const pack = d3.pack().size([props.width, props.height]).padding(3)

      const root = pack(hierarchy)

      const parent = d3
        .select(container.current)
        .append('svg')
        .attr('viewBox', [0, 0, props.width, props.height])
        .attr('height', props.height)
        .attr('width', props.width)
        .attr('font-size', 10)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')

      const data = root
        .descendants()
        .slice(
          1,
          props.maxNumBubbles
        ) as HierarchyCircularNode<VoterDisplayData>[]

      const group = parent
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', (d) => `translate(${d.x + 1},${d.y + 1})`)
        .style('opacity', (d) => (d.data.key === props.highlighted ? 1 : 0.5))
        .style('cursor', 'pointer')
        .on('mouseenter', function () {
          const node = d3
            .select(this)
            .datum() as HierarchyCircularNode<VoterDisplayData>
          props.onHighlight?.(node.data.key)
        })
        .on('mouseleave', () => {
          props.onHighlight?.()
        })
        .on('click', function () {
          const node = d3
            .select(this)
            .datum() as HierarchyCircularNode<VoterDisplayData>

          window.open(getExplorerUrl(props.endpoint, node.data.name), '_blank')
        })

      // draw circles
      group
        .append('circle')
        .attr('r', (d) => d.r)
        .attr('fill', (d) => color(voteTypeDomain(d.data.voteType)) as string)

      // add labels
      group
        .append('svg:text')
        .attr('fill', 'white')
        .style('pointer-events', 'none')
        .style('opacity', (d) => (d.data.key === props.highlighted ? 1 : 0.2))
        .style('transform', (d) =>
          d.data.key === props.highlighted ? 'scale(1.5)' : 'scale(1)'
        )
        .attr('y', '0.5em')
        .text((d) => abbreviateAddress(d.data.name))
    }
  }, [
    container,
    props.data,
    props.maxNumBubbles,
    d3,
    props.height,
    props.width,
    props.highlighted,
  ])

  return (
    <div ref={container} style={{ height: props.height, width: props.width }} />
  )
}

export default function ProposalTopVotersBubbleChart(
  props: Omit<Props, 'height' | 'width'>
) {
  return (
    <div className={props.className}>
      <AutoSizer>{(sizing) => <Content {...sizing} {...props} />}</AutoSizer>
    </div>
  )
}

ProposalTopVotersBubbleChart.defaultProps = {
  maxNumBubbles: 50,
}
