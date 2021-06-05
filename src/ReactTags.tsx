/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState, useRef } from 'react';
import { noop, uniq } from 'lodash';
import ClassNames from 'classnames';
import Suggestions from './Suggestions';
import Tag from './Tag';

import { buildRegExpFromDelimiters } from './utils';

// Constants
import {
  KEYS,
  DEFAULT_PLACEHOLDER,
  DEFAULT_CLASSNAMES,
  DEFAULT_LABEL_FIELD,
  INPUT_FIELD_POSITIONS,
} from './constants';

interface IReactTags {
  placeholder?: string;
  labelField?: string;
  suggestions?: {
    id: string;
  }[];
  delimiters?: number[];
  autofocus?: boolean;
  inline?: boolean; // TODO: Remove in v7.x.x
  // inputFieldPosition?: PropTypes.oneOf([
  //   INPUT_FIELD_POSITIONS.INLINE;
  //   INPUT_FIELD_POSITIONS.TOP;
  //   INPUT_FIELD_POSITIONS.BOTTOM;
  // ]);
  inputFieldPosition?: any;
  handleDelete?: (e: any, i: any) => void;
  handleAddition?: (t: any) => void;
  handleFilterSuggestions?: (q: any, s: any) => any;
  handleTagClick?: (e: any, i: any) => void;
  allowDeleteFromEmptyInput: boolean;
  allowAdditionFromPaste: boolean;
  handleInputChange?: (e: any) => void;
  handleInputFocus?: (v: any) => void;
  handleInputBlur?: (v: any) => void;
  minQueryLength?: number;
  shouldRenderSuggestions?: () => void;
  removeComponent?: React.ElementType;
  autocomplete?: boolean | number;
  readOnly?: boolean;
  classNames?: any;
  name?: string;
  id?: string;
  maxLength?: number;
  inputValue?: string;
  tags?: {
    id: string;
    className?: string;
  }[];
  allowUnique?: boolean;
  renderSuggestion?: (item: any, query: any) => JSX.Element;
  inputProps?: any;
}

const ReactTags: React.FC<IReactTags> = ({
  placeholder = DEFAULT_PLACEHOLDER,
  labelField = DEFAULT_LABEL_FIELD,
  suggestions = [],
  delimiters = [KEYS.ENTER, KEYS.TAB],
  autofocus = true,
  inline = true,
  inputFieldPosition = INPUT_FIELD_POSITIONS.INLINE,
  handleDelete = noop,
  handleAddition = noop,
  allowDeleteFromEmptyInput = true,
  allowAdditionFromPaste = true,
  autocomplete = false,
  readOnly = false,
  allowUnique = true,
  tags = [],
  inputProps = {},
  handleFilterSuggestions,
  handleTagClick,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  minQueryLength,
  shouldRenderSuggestions,
  removeComponent,
  classNames,
  name: inputName,
  id: inputId,
  maxLength,
  inputValue,
  renderSuggestion,
}) => {
  const textInput = useRef<HTMLInputElement>(null);
  const reactTagsRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    suggestions,
    query: '',
    isFocused: false,
    selectedIndex: -1,
    selectionMode: false,
    ariaLiveStatus: '',
  });

  const _resetAndFocusInput = () => {
    setState((prevState) => ({ ...prevState, query: '' }));
    if (textInput.current) {
      textInput.current.value = '';
      textInput.current.focus();
    }
  };

  useEffect(() => {
    if (!inline) {
      /* eslint-disable no-console */
      console.warn(
        '[Deprecation] The inline attribute is deprecated and will be removed in v7.x.x, please use inputFieldPosition instead.'
      );
      /* eslint-enable no-console */
    }
    if (autofocus && !readOnly) {
      _resetAndFocusInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // componentDidUpdate(prevProps) {
  //   if (!isEqual(prevProps.suggestions, this.props.suggestions)) {
  //     this.updateSuggestions();
  //   }
  // }

  const _getQueryIndex = (q: any, i: any) =>
    i[labelField].toLowerCase().indexOf(q.toLowerCase());

  const _filteredSuggestions = (q: any, s: any) => {
    if (handleFilterSuggestions) {
      return handleFilterSuggestions(q, s);
    }

    const exactSuggestions = suggestions.filter(
      (item) => _getQueryIndex(q, item) === 0
    );
    const partialSuggestions = suggestions.filter(
      (item) => _getQueryIndex(q, item) > 0
    );
    return exactSuggestions.concat(partialSuggestions);
  };

  const _handleDelete = (e: any, i: any) => {
    e.preventDefault();
    e.stopPropagation();
    const currentTags = tags.slice();
    // Early exit from the function if the array
    // is already empty
    if (currentTags.length === 0) {
      return;
    }
    let ariaLiveStatus = `Tag at index ${i} with value ${currentTags[i].id} deleted.`;
    handleDelete(e, i);
    const allTags =
      reactTagsRef.current &&
      reactTagsRef.current.querySelectorAll('.ReactTags__remove');

    let nextElementToFocus;
    let nextIndex;
    let nextTag;
    if (i === 0 && currentTags.length > 1) {
      [nextElementToFocus] = allTags!;
      nextIndex = 0;
      [nextTag] = currentTags;
    } else {
      nextElementToFocus = allTags![i - 1];
      nextIndex = i - 1;
      nextTag = currentTags[nextIndex];
    }
    if (!nextElementToFocus) {
      nextIndex = -1;
      nextElementToFocus = textInput;
    }
    if (nextIndex >= 0) {
      ariaLiveStatus += ` Tag at index ${nextIndex} with value ${nextTag.id} focussed. Press backspace to remove`;
    } else {
      ariaLiveStatus += 'Input focussed. Press enter to add a new tag';
    }
    // if (nextElementToFocus) {
    (nextElementToFocus as HTMLElement).focus();
    // }
    setState((prevState) => ({ ...prevState, ariaLiveStatus }));
  };

  const _handleTagClick = (e: any, i: any) => {
    if (handleTagClick) {
      handleTagClick(e, i);
    }
  };

  const _updateSuggestions = () => {
    const { query, selectedIndex } = state;
    const sug = _filteredSuggestions(query, suggestions);

    setState((prevState) => ({
      ...prevState,
      suggestions: sug,
      selectedIndex:
        selectedIndex >= sug.length ? sug.length - 1 : selectedIndex,
    }));
  };

  const _handleChange = async (e: any) => {
    if (handleInputChange) {
      handleInputChange(e.target.value);
    }

    const query = e.target.value.trim();

    await setState((prevProps) => ({ ...prevProps, query }));
    _updateSuggestions();
  };

  const _handleFocus = (e: any) => {
    const { value } = e.target;
    if (handleInputFocus) {
      handleInputFocus(value);
    }
    setState((prevProps) => ({ ...prevProps, isFocused: true }));
  };

  const _handleBlur = (e: any) => {
    const { value } = e.target;
    if (handleInputBlur) {
      handleInputBlur(value);
    }
    if (textInput.current) {
      textInput.current.value = '';
    }
    setState((prevProps) => ({ ...prevProps, isFocused: false }));
  };

  const _addTag = (t: any) => {
    let newTag = t;
    if (!t.id || !t[labelField]) {
      return;
    }
    const existingKeys = tags.map((tag) => tag.id.toLowerCase());

    // Return if tag has been already added
    if (allowUnique && existingKeys.indexOf(t.id.toLowerCase()) >= 0) {
      return;
    }
    if (autocomplete) {
      const possibleMatches = _filteredSuggestions(t[labelField], suggestions);

      if (
        (autocomplete === 1 && possibleMatches.length === 1) ||
        (autocomplete === true && possibleMatches.length)
      ) {
        [newTag] = possibleMatches;
      }
    }

    // call method to add
    handleAddition(newTag);

    // reset the state
    setState((prevState) => ({
      ...prevState,
      query: '',
      selectionMode: false,
      selectedIndex: -1,
    }));

    _resetAndFocusInput();
  };

  const _handleKeyDown = (e: any) => {
    const {
      query,
      selectedIndex,
      suggestions: _suggestions,
      selectionMode,
    } = state;

    // hide suggestions menu on escape
    if (e.keyCode === KEYS.ESCAPE) {
      e.preventDefault();
      e.stopPropagation();
      setState((prevProps) => ({
        ...prevProps,
        selectedIndex: -1,
        selectionMode: false,
        suggestions: [],
      }));
    }

    // When one of the terminating keys is pressed, add current query to the tags.
    // If no text is typed in so far, ignore the action - so we don't end up with a terminating
    // character typed in.
    if (delimiters.indexOf(e.keyCode) !== -1 && !e.shiftKey) {
      if (e.keyCode !== KEYS.TAB || query !== '') {
        e.preventDefault();
      }

      const selectedQuery =
        selectionMode && selectedIndex !== -1
          ? _suggestions[selectedIndex]
          : { id: query, [labelField]: query };

      // Is it always true?
      // if (selectedQuery !== '') {
      //   this.addTag(selectedQuery);
      // }
      _addTag(selectedQuery);
    }

    // when backspace key is pressed and query is blank, delete tag
    if (
      e.keyCode === KEYS.BACKSPACE &&
      query === '' &&
      allowDeleteFromEmptyInput
    ) {
      _handleDelete(tags.length - 1, e);
    }

    // up arrow
    if (e.keyCode === KEYS.UP_ARROW) {
      e.preventDefault();
      setState((prevState) => ({
        ...prevState,
        selectedIndex:
          selectedIndex <= 0 ? _suggestions.length - 1 : selectedIndex - 1,
        selectionMode: true,
      }));
    }

    // down arrow
    if (e.keyCode === KEYS.DOWN_ARROW) {
      e.preventDefault();
      setState((prevState) => ({
        ...prevState,
        selectedIndex:
          _suggestions.length === 0
            ? -1
            : (selectedIndex + 1) % _suggestions.length,
        selectionMode: true,
      }));
    }
  };

  const _handlePaste = (e: any) => {
    if (!allowAdditionFromPaste) {
      return;
    }

    e.preventDefault();

    // TODO: window.clipboardData - doesn't exist - security issue? - https://stackoverflow.com/a/30381888
    // const clipboardData = e.clipboardData || window.clipboardData;
    const { clipboardData } = e;
    const clipboardText = clipboardData.getData('text');

    const maximumLength = maxLength || clipboardText.length;

    const maxTextLength = Math.min(maximumLength, clipboardText.length);
    const pastedText = clipboardData.getData('text').substr(0, maxTextLength);

    // Used to determine how the pasted content is split.
    const delimiterRegExp = buildRegExpFromDelimiters(delimiters);
    const t = pastedText.split(delimiterRegExp);

    // Only add unique tags
    uniq(t).forEach((tag) => _addTag({ id: tag, [labelField]: tag }));
  };

  const _handleSuggestionClick = (i: any) => {
    _addTag(state.suggestions[i]);
  };

  const _handleSuggestionHover = (i: any) => {
    setState((prevState) => ({
      ...prevState,
      selectedIndex: i,
      selectionMode: true,
    }));
  };

  const _getTagItems = () =>
    tags.map((tag, index) => (
      <Tag
        key={index}
        index={index}
        tag={tag}
        labelField={labelField}
        onDelete={(e: any) => _handleDelete(e, index)}
        removeComponent={removeComponent}
        onTagClicked={(e: any) => _handleTagClick(e, index)}
        readOnly={readOnly}
        classNames={{ ...DEFAULT_CLASSNAMES, ...classNames }}
      />
    ));

  const tagItems = _getTagItems();
  const _classNames = { ...DEFAULT_CLASSNAMES, ...classNames };

  // get the suggestions for the given query
  const query = state.query.trim();
  const { selectedIndex } = state;
  const _suggestions = state.suggestions;

  const position = !inline ? INPUT_FIELD_POSITIONS.BOTTOM : inputFieldPosition;

  const tagInput = !readOnly ? (
    <div className={_classNames.tagInput}>
      <input
        {...inputProps}
        ref={textInput}
        className={_classNames.tagInputField}
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        onFocus={_handleFocus}
        onBlur={_handleBlur}
        onChange={_handleChange}
        onKeyDown={_handleKeyDown}
        onPaste={_handlePaste}
        name={inputName}
        id={inputId}
        maxLength={maxLength}
        value={inputValue}
        data-automation="input"
        data-testid="input"
      />

      <Suggestions
        query={query}
        suggestions={_suggestions}
        labelField={labelField}
        selectedIndex={selectedIndex}
        handleClick={_handleSuggestionClick}
        handleHover={_handleSuggestionHover}
        minQueryLength={minQueryLength}
        shouldRenderSuggestions={shouldRenderSuggestions}
        isFocused={state.isFocused}
        classNames={_classNames}
        renderSuggestion={renderSuggestion}
      />
    </div>
  ) : null;

  return (
    <div
      className={ClassNames(_classNames.tags, 'react-tags-wrapper')}
      ref={reactTagsRef}
    >
      <p
        role="alert"
        className="sr-only"
        style={{
          position: 'absolute',
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          margin: '-1px',
          padding: 0,
          width: '1px',
          height: '1px',
          border: 0,
        }}
      >
        {state.ariaLiveStatus}
      </p>
      {position === INPUT_FIELD_POSITIONS.TOP && tagInput}
      <div className={_classNames.selected}>
        {tagItems}
        {position === INPUT_FIELD_POSITIONS.INLINE && tagInput}
      </div>
      {position === INPUT_FIELD_POSITIONS.BOTTOM && tagInput}
    </div>
  );
};

export default ReactTags;
