// import { useEffect, useState } from 'react'
// import Multiple from 'multiple.js'
// useEffect(() => {
//   if (typeof document !== 'undefined' && !initialized) {
//     new Multiple({
//       selector: '.step-indicator-with-gradient',
//       background: 'linear-gradient(to right, #00c2ff 0%, #00e4ff 50%, #87f2ff 100%);'
//     })
//     setInitialized(true)
//   }
// })
// const [initialized, setInitialized] = useState(false)
import Header from 'components_2/Header'
function StepProgressIndicator({
  currentStep,
  totalSteps,
  stepDescription = '',
}) {
  const elementsWithGradient: JSX.Element[] = []
  const elementsWithoutGradient: JSX.Element[] = []

  for (let i = 1; i < totalSteps + 1; i++) {
    let className = `w-[18px] h-[1px] `
    if (i <= currentStep) {
      // className += 'step-indicator-with-gradient'
      elementsWithGradient.push(<div key={i} className={className}></div>)
    } else {
      className += 'bg-black'
      elementsWithoutGradient.push(<div key={i} className={className}></div>)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex space-x-1 step-indicator">
        <div className="flex space-x-1 step-indicator__with-gradient">
          {elementsWithGradient}
        </div>
        <div className="flex space-x-1 step-indicator__without-gradient">
          {elementsWithoutGradient}
        </div>
      </div>
      <div className="flex pt-2 space-x-1 text-sm md:text-base">
        <div className="text-[#6de9ff]">Step {currentStep}</div>
        <div>{stepDescription}</div>
      </div>
    </div>
  )
}

export default function FormHeader({
  currentStep,
  totalSteps,
  stepDescription,
  title,
  imgSrc,
  imgAlt,
}) {
  return (
    <div>
      <StepProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription={stepDescription}
      />
      <div className="flex items-center pt-10 md:pt-0">
        <Header as="h1">{title}</Header>
        <img
          src={imgSrc}
          className="max-w-[420px] hidden md:block"
          alt={imgAlt}
        />
      </div>
    </div>
  )
}
