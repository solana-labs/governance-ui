import { useRef, useEffect, useState } from 'react'
import Button from 'components_2/Button'

export function ImageUploader({
  title,
  description,
  error = '',
  defaultValue,
  onSelect,
}) {
  const [selectedFile, setSelectedFile] = useState<string | ArrayBuffer>(
    defaultValue
  )
  const [validationError, setValidationError] = useState('')
  const inputElement = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (defaultValue) {
      setSelectedFile(defaultValue)
    }
  }, [defaultValue])

  function triggerInput() {
    inputElement?.current?.click()
  }

  function handleFileRead(file) {
    setSelectedFile('')
    setValidationError('')
    const reader = new FileReader()
    reader.onloadend = function () {
      // Since it contains the Data URI, we should remove the prefix and keep only Base64 string
      // e.g replace(/^data:.+;base64,/, '');
      if (reader.result instanceof ArrayBuffer) return

      if (reader.result) {
        const b64 = reader.result //.replace(/^data:.+;base64,/, '');
        setSelectedFile(b64)
        onSelect(b64)
      }
    }

    if (file?.size <= 1000000) {
      reader.readAsDataURL(file)
    } else {
      onSelect()
      setValidationError('File size exceeds 1MB')
    }
  }

  function handleChange(ev) {
    setValidationError('')
    const file = ev.target.files[0]
    handleFileRead(file)
  }

  function handleDrag(ev) {
    ev.stopPropagation()
    ev.preventDefault()
    // Style the drag-and-drop as a "copy file" operation.
    ev.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(ev) {
    ev.stopPropagation()
    ev.preventDefault()
    const fileList = ev.dataTransfer.files
    handleFileRead(fileList[0])
  }

  return (
    <div
      className="flex flex-wrap items-center md:space-x-8"
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="pb-4 mx-auto w-fit md:pb-0">
        {selectedFile && !validationError ? (
          <div className="flex flex-col items-center w-[173px] h-[173px]">
            <div className="w-36 h-36">
              {selectedFile instanceof ArrayBuffer ? (
                <div />
              ) : (
                <img src={selectedFile} />
              )}
            </div>
          </div>
        ) : (
          <Button type="button" withBorder onClick={triggerInput}>
            <div className="flex flex-col px-12 py-10">
              <img
                src="/1-Landing-v2/icon-arrow-blue.png"
                className="w-6 h-6 mx-2 -rotate-90"
              />
              <div>Add</div>
            </div>
          </Button>
        )}
        <input
          type="file"
          className="hidden"
          ref={inputElement}
          onChange={handleChange}
          accept="image/png, image/jpeg"
        />
      </div>
      <div className="flex flex-col grow">
        <div className="text-lg md:text-xl">{title}</div>
        <div className="pt-5 pb-4 text-base opacity-60 md:text-lg">
          {description}
        </div>
        {(!validationError || !error) && selectedFile && (
          <div className="w-fit">
            <Button withBorder type="button" onClick={triggerInput}>
              <div className="px-2">Select new image</div>
            </Button>
          </div>
        )}
        <div
          className={`${
            validationError || error ? 'visibile' : 'invisible'
          } pt-2 text-base md:text-lg text-red min-h-[2rem]`}
        >
          {validationError || error}
        </div>
      </div>
    </div>
  )
}

export default function FormField({
  title,
  optional = false,
  advancedOption = false,
  description,
  error = '',
  children,
}) {
  return (
    <div>
      <div className="flex items-baseline space-x-3">
        <div className="text-lg md:text-xl">{title}</div>
        {optional && <div className="opacity-60">(optional)</div>}
        {advancedOption && (
          <div className="bg-[#201F27] px-2 text-white/60 rounded">
            Advanced Option
          </div>
        )}
      </div>
      <div className="pt-5 pb-4 text-base opacity-60 md:text-lg">
        {description}
      </div>
      <div>{children}</div>
      <div
        className={`${
          error ? 'visibile' : 'invisible'
        } pt-2 text-base md:text-lg text-red min-h-[2rem]`}
      >
        {error}
      </div>
    </div>
  )
}
