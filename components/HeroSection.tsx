import GradientText from './GradientText'
import Button from './Button'
import Link from './Link'

const HeroSection = () => {
  return (
    <section className="">
      <div className="max-w-6xl px-8 mx-auto">
        <div className="relative pt-16 md:pt-32 pb-2">
          <div className="mb-8 mx-auto text-left md:text-center lg:text-center">
            <h2 className="mb-4 text-3xl md:text-5xl lg:text-5xl text-white font-bold font-heading">
              Claim your stake in the <GradientText>Mango Dao</GradientText>.
            </h2>
            <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
              Join us in building Mango, the protocol for permissionless margin trading &amp; lending.
            </p>
          </div>
          <div className="mb-16 flex lg:flex-row md:flex-row lg:justify-center md:justify-center sm:justify-center">
            <a className="sm:px-1" rel="noreferrer" target="_blank" href="#">
              <Button>Contribute now</Button>
            </a>
            <a className="pl-2 " rel="noreferrer" target="_blank" href="#">
              <Link>Learn more</Link>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
