export interface formValidation {
  isValid: boolean
  validationErrors: any
}

export const isFormValid = async (schema, formValues, abortEarly = false) => {
  if (!schema) {
    throw 'pleas provide schema'
  }
  const values = Object.create(null)
  Object.defineProperty(values, 'isValid', {
    value: false,
    writable: true,
    enumerable: true,
    configurable: false,
  })
  Object.defineProperty(values, 'validationErrors', {
    value: Object.create(null),
    writable: false,
    enumerable: true,
    configurable: false,
  })

  try {
    await schema.validate(formValues, { abortEarly })
    values.isValid = true
  } catch (err) {
    values.isValid = false
    const fieldName = err.path
    if (
      abortEarly &&
      Object.prototype.hasOwnProperty.call(schema.fields, fieldName)
    ) {
      values.validationErrors[fieldName] = err.errors
    } else {
      err.inner.forEach((error) => {
        const fieldName = error.path
        if (
          error.path &&
          Object.prototype.hasOwnProperty.call(schema.fields, fieldName)
        ) {
          values.validationErrors[fieldName] = error.message
        }
      })
    }
  }
  return values
}
