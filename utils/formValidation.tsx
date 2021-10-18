export interface formValidation {
  isValid: boolean
  validationErrors: any
}

export const isFormValid = async (schema, formValues) => {
  const values = {
    isValid: false,
    validationErrors: {},
  }
  try {
    await schema.validate(formValues, { abortEarly: false })
    values.isValid = true
  } catch (err) {
    values.isValid = false
    err.inner.forEach((error) => {
      if (error.path) {
        values.validationErrors[error.path] = error.message
      }
    })
  }
  return values
}
