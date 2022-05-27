import FormSummary from './FormSummary'

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
      {steps.map(({ Form }, index) => {
        const visible = index + 1 == currentStep
        return (
          <div key={index} className={visible ? '' : 'hidden'}>
            <Form
              visible={visible}
              formData={formData}
              currentStep={index + 1}
              totalSteps={steps.length + 1}
              onPrevClick={handlePreviousButton}
              onSubmit={handleNextButtonClick}
            />
          </div>
        )
      })}

      {currentStep == steps.length + 1 && (
        <FormSummary
          type={type}
          currentStep={steps.length + 1}
          formData={formData}
          onPrevClick={handlePreviousButton}
          onSubmit={handleSubmit}
          submissionPending={submissionPending}
        />
      )}
    </>
  )
}
