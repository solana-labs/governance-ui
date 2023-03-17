import { ImageNode as ImageNodeModel } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  image: ImageNodeModel;
  isClipped?: boolean;
  isLast?: boolean;
  showExpand?: boolean;
  onExpand?(): void;
}

// eslint-disable-next-line
export function ImageNode(props: Props) {
  return <div />;
}
