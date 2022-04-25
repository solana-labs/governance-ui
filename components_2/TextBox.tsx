export const TextBox = ({ title, text }) => {
  return (
    <div className="pr-16">
      <p className="font-bold">{title}</p>
      <p className="opacity-70">{text}</p>
    </div>
  )
}
