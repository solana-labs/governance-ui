export default function Text({ level = '1', className = '', children }) {
  let classNames = 'landing-page'
  if (level === '1') {
    classNames += ` text-base`
  } else if (level === '2') {
    classNames += ` text-sm`
  } else if (level === '3') {
    classNames += ` text-xs`
  }

  classNames += ` ${className}`

  return <div className={classNames}>{children}</div>
}
