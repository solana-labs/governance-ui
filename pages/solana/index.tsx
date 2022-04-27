import { useInView } from 'react-intersection-observer'
import ScrollWrapper from '../../components_2/ScrollWrapper'

const Solana = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  return (
    <div>
      <ScrollWrapper inView={inView}>
        <div ref={ref} className="inview-block"></div>
      </ScrollWrapper>
    </div>
  )
}

export default Solana
