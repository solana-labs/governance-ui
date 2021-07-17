const GradientText = (props) => (
  <span
    className={`${props.className} text-transparent bg-clip-text bg-gradient-to-bl from-secondary-1-light via-primary-dark to-secondary-2-light`}
  >
    {props.children}
  </span>
)

export default GradientText
