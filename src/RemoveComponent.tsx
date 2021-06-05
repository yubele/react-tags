import React from 'react';
import { KEYS } from './constants';

interface IRemoveComponent {
  className?: string;
  onRemove: (event: any, index: number) => any;
  readOnly?: boolean;
  removeComponent?: React.ElementType;
  tag: {
    id: string;
    className?: string;
    key?: string;
  };
  index: number;
}

const crossStr = String.fromCharCode(215);
const RemoveComponent: React.FC<IRemoveComponent> = ({
  className,
  onRemove,
  readOnly,
  removeComponent,
  tag,
  index,
}) => {
  const onKeydown = (event: any) => {
    if (event.keyCode === KEYS.ENTER || event.keyCode === KEYS.SPACE) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.keyCode === KEYS.BACKSPACE) {
      onRemove(event, index);
    }
  };

  if (readOnly) {
    return <span />;
  }

  const ariaLabel = `Tag at index ${index} with value ${tag.id} focussed. Press backspace to remove`;
  if (removeComponent) {
    const Component = removeComponent;
    return (
      <Component
        onRemove={onRemove}
        onKeyDown={onKeydown}
        className={className}
        aria-label={ariaLabel}
        tag={tag}
        index={index}
      />
    );
  }

  return (
    <button
      onClick={(e) => onRemove(e, index)}
      onKeyDown={onKeydown}
      className={className}
      aria-label={ariaLabel}
    >
      {crossStr}
    </button>
  );
};

export default RemoveComponent;
