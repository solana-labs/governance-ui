import image from './logoimage.png';

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

export function RealmCircleImage(props: Props) {
  return <img {...props} src={image.src} />;
}
