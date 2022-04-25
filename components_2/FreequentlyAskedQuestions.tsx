import GradientTitle from './GradientTitle'
import { FqaPanel } from './FqaPanel'

const FreequentlyAskedQuestions = () => {
  return (
    <div className="py-20 px-56">
      <div className="text-blue">
        <img src="/img/realms-web/icons/faq.svg" className="my-2 h-7" alt="" />
        <GradientTitle>Frequently Asked Questions (FAQs)</GradientTitle>
      </div>

      <div>
        <FqaPanel
          question="I still don’t understand DAOs. Can you explain again?"
          answer="Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit."
        />
        <hr className="border-fgd-4" />
        <FqaPanel
          question="Who can start a DAO?"
          answer="Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit."
        />
        <hr className="border-fgd-4" />
        <FqaPanel
          question="Why should I use Solana for my DAO"
          answer="Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit."
        />
        <hr className="border-fgd-4" />
        <FqaPanel
          question="What is SPL-Governance?"
          answer="Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit."
        />
        <hr className="border-fgd-4" />
        <FqaPanel
          question="What is the environmental impact of running a DAO?"
          answer="Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit."
        />
      </div>
    </div>
  )
}

export default FreequentlyAskedQuestions
