const GradientTitle = (props) => (
  <div>
    <h1 className="text-2xl font-normal md:text-4xl">
      <span className="bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent">
        {props.children}
      </span>
    </h1>
  </div>
)

export default GradientTitle
