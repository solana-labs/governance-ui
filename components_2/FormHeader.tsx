import Header from 'components_2/ProductHeader'
import Text from 'components_2/ProductText'
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
        <Text level="2" className="text-[#6de9ff]">
          Step {currentStep}
        </Text>
        <Text level="2">{stepDescription}</Text>
      </div>
    </div>
  )
}

export default function FormHeader({
  currentStep,
  totalSteps,
  stepDescription,
  title,
}) {
  return (
    <div>
      <StepProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription={stepDescription}
      />
      <div className="flex items-center w-full pt-10 md:pt-20">
        <Header as="h2" className="md:max-w-[633px]">
          {title}
        </Header>
      </div>
    </div>
  )
}
