import React, { useRef, useEffect, memo } from 'react';
import { escape, isEqual } from 'lodash';

const maybeScrollSuggestionIntoView = (
  suggestionEl: any,
  suggestionsContainer: any
) => {
  const containerHeight = suggestionsContainer.offsetHeight;
  const suggestionHeight = suggestionEl.offsetHeight;
  const relativeSuggestionTop =
    suggestionEl.offsetTop - suggestionsContainer.scrollTop;

  if (relativeSuggestionTop + suggestionHeight >= containerHeight) {
    // eslint-disable-next-line no-param-reassign
    suggestionsContainer.scrollTop +=
      relativeSuggestionTop - containerHeight + suggestionHeight;
  } else if (relativeSuggestionTop < 0) {
    // eslint-disable-next-line no-param-reassign
    suggestionsContainer.scrollTop += relativeSuggestionTop;
  }
};

interface ISuggestions {
  query: string;
  selectedIndex: number;
  suggestions: any[];
  handleClick: (i: any) => void;
  handleHover: (i: any) => void;
  minQueryLength?: number;
  shouldRenderSuggestions?: () => void;
  isFocused: boolean;
  classNames?: {
    suggestions?: string;
    activeSuggestion?: string;
  };
  labelField: string;
  renderSuggestion?: (item: any, query: any) => JSX.Element;
}

const shouldRerender = (q: any, minQueryLength: any, isFocused: any) =>
  q.length >= minQueryLength && isFocused;

const areEqual = (prevProps: any, nextProps: any) =>
  prevProps.isFocused !== nextProps.isFocused ||
  !isEqual(prevProps.suggestions, nextProps.suggestions) ||
  shouldRerender(
    nextProps.query,
    nextProps.minQueryLength,
    nextProps.isFocused
  ) ||
  shouldRerender(
    nextProps.query,
    nextProps.minQueryLength,
    nextProps.isFocused
  ) !==
    shouldRerender(
      prevProps.query,
      prevProps.minQueryLength,
      prevProps.isFocused
    );

const Suggestions: React.FC<ISuggestions> = ({
  query,
  selectedIndex,
  suggestions,
  handleClick,
  handleHover,
  minQueryLength = 2,
  shouldRenderSuggestions,
  isFocused,
  classNames = {},
  labelField,
  renderSuggestion,
}) => {
  const suggestionsContainer = useRef(null);

  useEffect(() => {
    // const activeSuggestion =
    //   suggestionsContainer.current &&
    //   suggestionsContainer.current.querySelector(classNames.activeSuggestion);
    const activeSuggestion = suggestionsContainer.current;

    if (activeSuggestion) {
      maybeScrollSuggestionIntoView(activeSuggestion, suggestionsContainer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  const markIt = (i: any, q: any) => {
    const escapedRegex = q.trim().replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    const { [labelField]: labelValue } = i;

    return {
      __html: labelValue.replace(
        RegExp(escapedRegex, 'gi'),
        (x: any) => `<mark>${escape(x)}</mark>`
      ),
    };
  };

  const _shouldRenderSuggestions = (q: any) =>
    q.length >= minQueryLength && isFocused;

  const _renderSuggestion = (i: any, q: any) => {
    if (typeof renderSuggestion === 'function') {
      return renderSuggestion(i, q);
    }
    return <span dangerouslySetInnerHTML={markIt(i, q)} />;
  };

  const suggs = suggestions.map((item, i) => (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      key={i}
      onMouseDown={() => handleClick(i)}
      onTouchStart={() => handleClick(i)}
      onMouseOver={() => handleHover(i)}
      onFocus={() => handleHover(i)}
      className={i === selectedIndex ? classNames.activeSuggestion : ''}
    >
      {_renderSuggestion(item, query)}
    </li>
  ));

  // use the override, if provided
  const handleShouldRenderSuggestions =
    shouldRenderSuggestions || _shouldRenderSuggestions;

  if (suggestions.length === 0 || !handleShouldRenderSuggestions(query)) {
    return null;
  }

  return (
    <div ref={suggestionsContainer} className={classNames.suggestions}>
      <ul>{suggs}</ul>
    </div>
  );
};

export default memo(Suggestions, areEqual);
