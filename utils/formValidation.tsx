import { SanitizedObject } from './helpers';

export interface formValidation {
  isValid: boolean;
  validationErrors: any;
}

export const isFormValid = async (schema, formValues, abortEarly = false) => {
  if (!schema) {
    throw 'please provide schema';
  }

  const values = new SanitizedObject({
    isValid: false,
    validationErrors: new SanitizedObject({}),
  }) as formValidation;

  try {
    await schema.validate(formValues, { abortEarly });
    values.isValid = true;
  } catch (err) {
    console.error('Validation Error', err);

    values.isValid = false;
    const fieldName = err.path;
    if (
      abortEarly &&
      Object.prototype.hasOwnProperty.call(schema.fields, fieldName)
    ) {
      values.validationErrors[fieldName] = err.errors;
    } else {
      err.inner?.forEach((error) => {
        const fieldName = error.path;
        if (
          error.path &&
          Object.prototype.hasOwnProperty.call(schema.fields, fieldName)
        ) {
          values.validationErrors[fieldName] = error.message;
        }
      });
    }
  }
  return values;
};
