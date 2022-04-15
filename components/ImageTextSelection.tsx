export type ImageTextElement<T> = {
  id: T;
  name: string;
  image?: string;
};

export default function ImageTextSelection<T>({
  selected,
  className,
  onClick,
  imageTextElements,
}: {
  selected: T | null;
  className?: string;
  onClick: (selected: T | null) => void;
  imageTextElements: ImageTextElement<T>[];
}) {
  return (
    <div className={`flex items-center space-x-3 h-12 ${className}`}>
      {imageTextElements.map(({ id, name, image }, index) => {
        return (
          <div
            className="relative h-full w-auto pt-2 pb-2 flex justify-center items-center"
            key={index}
          >
            {image ? (
              // Image
              <img
                title={name}
                src={image}
                className={`h-7 max-w-7 p-0.5 hover:grayscale-0 ${
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
        );
      })}
    </div>
  );
}
