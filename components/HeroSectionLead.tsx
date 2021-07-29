import GradientText from './GradientText'
import usePool from '../hooks/usePool'

const HeroSectionLead = () => {
  const { startIdo } = usePool()

  return (
    <section className="flex">
      <div className="px-8 pb-24 mb-16 mx-auto h-auto justify-items-center align-middle">
        <div className="relative pt-16 md:pt-32 pb-2">
          <div className="max-w-2xl mb-16 mx-auto text-left md:text-center lg:text-center">
            <h2 className="mb-8 text-7xl text-white font-bold font-heading">
              <GradientText>WEN</GradientText> TOKEN?
            </h2>
            <p className="mb-8 text-2xl">
              {startIdo.format('dddd, MMMM Do YYYY, h:mm:ss a')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSectionLead
