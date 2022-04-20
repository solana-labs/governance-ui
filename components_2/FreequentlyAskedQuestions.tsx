import GradientTitle from './GradientTitle'
import { FqaPanel } from './FqaPanel'

const FreequentlyAskedQuestions = () => {
  return (
    <div className="py-20 px-56">
      <div className="text-blue">
        <img src="/img/realms-web/icons/faq.svg" className="my-2 h-7" alt="" />
        <h1 className="md:text-3xl font-thin mb-16">
          <GradientTitle>Frequently Asked Questions (FAQs)</GradientTitle>
        </h1>
      </div>

      <div>
        <FqaPanel />
      </div>
    </div>
  )
}

export default FreequentlyAskedQuestions
