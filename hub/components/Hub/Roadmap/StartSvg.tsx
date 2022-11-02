interface Props extends React.SVGAttributes<SVGElement> {}

export function StartSvg(props: Props) {
  return (
    <svg {...props} viewBox="0 0 74 107" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M40.4286 73.0468C58.7026 71.3274 73 56.0034 73 37.3537C73 17.5522 56.8823 1.5 37 1.5C17.1177 1.5 0.999999 17.5522 0.999999 37.3537C0.999999 50.2112 7.79557 61.488 18.0048 67.8158C27.3933 73.635 37 82.1616 37 93.2073V106.5"
        strokeWidth="2"
        strokeDasharray="5 4"
      />
    </svg>
  );
}
