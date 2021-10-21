export interface formValidation {
  isValid: boolean
  validationErrors: any
}

export const isFormValid = async (schema, formValues, abortEarly = false) => {
  const values = {
    isValid: false,
    validationErrors: {},
  }
  try {
    await schema.validate(formValues, { abortEarly })
    values.isValid = true
  } catch (err) {
    values.isValid = false
    if (abortEarly) {
      values.validationErrors[err.path] = err.errors
    } else {
      err.inner.forEach((error) => {
        if (error.path) {
          values.validationErrors[error.path] = error.message
        }
      })
    }
  }
  return values
}
