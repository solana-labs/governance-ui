const GradientText = (props) => (
  <span
    className={`${props.className} text-transparent bg-clip-text bg-gradient-to-br from-mango-red via-mango-yellow to-mango-green`}
  >
    {props.children}
  </span>
)

export default GradientText
