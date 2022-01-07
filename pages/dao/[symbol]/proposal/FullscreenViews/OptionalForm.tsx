import Input from '@components/inputs/Input'

const OptionalForm = ({ form, handleSetForm }) => {
  return (
    <div className="mb-20">
      <Input
        noMaxWidth
        useDefaultStyle
        wrapperClassName="mb-6"
        label="Title of your proposal"
        placeholder="Title of your proposal (optional)"
        value={form.title}
        type="text"
        onChange={(event) =>
          handleSetForm({
            value: event.target.value,
            propertyName: 'title',
          })
        }
      />

      <Input
        noMaxWidth
        useDefaultStyle
        wrapperClassName="mb-6"
        label="Description"
        placeholder="Describe your proposal (optional)"
        value={form.description}
        type="text"
        onChange={(event) =>
          handleSetForm({
            value: event.target.value,
            propertyName: 'description',
          })
        }
      />
    </div>
  )
}

export default OptionalForm
