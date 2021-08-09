import { ChevronDownIcon } from '@heroicons/react/solid'
import GradientText from './GradientText'
import Button from './Button'

function scrollToId(id: string) {
  const element = document.getElementById(id)
  const y = element.getBoundingClientRect().top + window.scrollY
  window.scroll({
    top: y,
    behavior: 'smooth',
  })
}

const HeroSection = () => {
  return (
    <section className="">
      <div className="max-w-6xl px-8 mx-auto">
        <div className="relative pt-16 md:pt-32 pb-2">
          <div className="mb-8 mx-auto text-left md:text-center lg:text-center">
            <h2 className="mb-4 text-3xl md:text-5xl lg:text-5xl text-white font-bold font-heading">
              Claim your stake in the <GradientText>Mango DAO</GradientText>.
            </h2>
            <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-70">
              Join us in building Mango, the protocol for permissionless
              leverage trading &amp; lending.
            </p>
          </div>
          <div className="mb-16 flex flex-col items-center">
            <a className="mb-6" onClick={() => scrollToId('contribute')}>
              <Button>Contribute Now</Button>
            </a>
            <a
              className="cursor-pointer flex flex-col items-center text-fgd-1 hover:underline"
              onClick={() => scrollToId('about')}
            >
              <div>Learn More</div>
              <ChevronDownIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
