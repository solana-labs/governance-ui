import { capitalize } from '@utils/helpers'

const ErrorField = ({ text }) => {
  return text ? (
    <div className="text-red text-xs">{text ? capitalize(text) : text}</div>
  ) : null
}

export default ErrorField
