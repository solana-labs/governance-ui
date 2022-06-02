import FormSummary from '@components/NewRealmWizard/components/FormSummary'

export default function CreateDAOWizard({
  type,
  steps,
  currentStep,
  formData,
  handlePreviousButton,
  handleNextButtonClick,
  handleSubmit,
  submissionPending,
}) {
  return (
    <>
      {steps.map(({ Form, ...props }, index) => {
        delete props.schema
        delete props.required
        const visible = index == currentStep
        return (
          <div key={index} className={visible ? '' : 'hidden'}>
            <Form
              type={type}
              visible={visible}
              formData={formData}
              currentStep={index}
              totalSteps={steps.length + 1}
              onPrevClick={handlePreviousButton}
              onSubmit={handleNextButtonClick}
              {...props}
            />
          </div>
        )
      })}

      {currentStep == steps.length + 1 && (
        <FormSummary
          type={type}
          currentStep={currentStep}
          formData={formData}
          onPrevClick={handlePreviousButton}
          onSubmit={handleSubmit}
          submissionPending={submissionPending}
        />
      )}
    </>
  )
}
