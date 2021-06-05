import React from 'react';
import cs from 'classnames';
import { noop } from 'lodash';

import RemoveComponent from './RemoveComponent';

interface ITag {
  labelField?: string;
  onDelete: (e: any, index: number) => void;
  tag: {
    id: string;
    className?: string;
    key?: string;
    [key: string]: any;
  };
  removeComponent?: React.ElementType;
  onTagClicked?: (e: any, index: number) => void;
  classNames?: {
    tag?: string;
    remove?: string;
  };
  readOnly?: boolean;
  index: number;
}

const Tag: React.FC<ITag> = ({
  labelField = 'text',
  onDelete,
  tag,
  removeComponent,
  onTagClicked = noop,
  classNames = {},
  readOnly = false,
  index,
}) => {
  const label = tag[labelField];
  const { className = '' } = tag;
  /* istanbul ignore next */
  // const opacity = isDragging ? 0 : 1;
  const tagComponent = (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      className={cs('tag-wrapper', classNames.tag, className)}
      onClick={(e) => onTagClicked(e, index)}
      onKeyDown={(e) => onTagClicked(e, index)}
      onTouchStart={(e) => onTagClicked(e, index)}
    >
      {label}
      <RemoveComponent
        tag={tag}
        className={classNames.remove}
        removeComponent={removeComponent}
        onRemove={(e) => onDelete(e, index)}
        readOnly={readOnly}
        index={index}
      />
    </span>
  );
  return tagComponent;
};

export default Tag;
