export default function FormField({
  title,
  optional = false,
  description,
  error = '',
  children,
}) {
  return (
    <div>
      <div className="flex items-baseline space-x-3">
        <div className="text-lg md:text-xl">{title}</div>
        {optional && <div className="opacity-60">(optional)</div>}
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
