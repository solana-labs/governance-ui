const GradientText = (props) => (
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-green-300">
    {props.children}
  </span>
)

export default GradientText
