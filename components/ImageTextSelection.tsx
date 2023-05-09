export type ImageTextElement<T> = {
  id: T
  name: string
  image?: string
}

export default function ImageTextSelection<T>({
  selected,
  className,
  onClick,
  imageTextElements,
}: {
  selected: T | null
  className?: string
  onClick: (selected: T | null) => void
  imageTextElements: ImageTextElement<T>[]
}) {
  return (
    <div className="flex h-auto border-b border-fgd-3 grow w-full">
      <div
        className="h-auto pl-2 pr-2 flex justify-center items-center border-r shrink-0 text-xs text-fgd-3 text-center"
        style={{
          width: '6rem',
          minWidth: '6rem',
          maxWidth: '6rem',
        }}
      >
        {selected === null
          ? 'All'
          : imageTextElements.find(({ id }) => id === selected)!.name}
      </div>

      <div className={`flex items-center space-x-2 flex-wrap ${className}`}>
        {imageTextElements.map(({ id, name, image }, index) => {
          return (
            <div
              className="relative h-12 w-auto pt-2 pb-2 flex justify-center items-center"
              key={index}
            >
              {image ? (
                // Image
                <img
                  title={name}
                  src={image}
                  className={`h-7 max-w-5 p-1 hover:grayscale-0 ${
                    selected !== id ? 'grayscale' : ''
                  } cursor-pointer`}
                  onClick={() => onClick(id)}
                />
              ) : (
                // Text
                <span
                  className={`text-xs hover:text-white cursor-pointer ${
                    selected !== id ? 'text-gray-400' : 'text-white'
                  }`}
                  onClick={() => onClick(id)}
                >
                  {name}
                </span>
              )}

              {selected === id ? (
                // Selected visual
                <div className="p-0 absolute bottom-0 w-full h-0.5 flex justify-center bg-fgd-3 rounded-tl rounded-tr" />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
