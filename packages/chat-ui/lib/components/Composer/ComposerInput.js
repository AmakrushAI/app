"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComposerInput = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Input = require("../Input");
var _SendConfirm = require("../SendConfirm");
var _riseInput = _interopRequireDefault(require("./riseInput"));
var _parseDataTransfer = _interopRequireDefault(require("../../utils/parseDataTransfer"));
var _canUse = _interopRequireDefault(require("../../utils/canUse"));
var _excluded = ["inputRef", "invisible", "onImageSend", "disabled", "showTransliteration", "cursorPosition", "setCursorPosition", "onChange", "value"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var canTouch = (0, _canUse.default)('touch');
var ComposerInput = function ComposerInput(_ref) {
  var inputRef = _ref.inputRef,
    invisible = _ref.invisible,
    onImageSend = _ref.onImageSend,
    disabled = _ref.disabled,
    showTransliteration = _ref.showTransliteration,
    cursorPosition = _ref.cursorPosition,
    setCursorPosition = _ref.setCursorPosition,
    onChange = _ref.onChange,
    value = _ref.value,
    rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var _useState = (0, _react.useState)(null),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    pastedImage = _useState2[0],
    setPastedImage = _useState2[1];
  var _useState3 = (0, _react.useState)([]),
    _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
    suggestions = _useState4[0],
    setSuggestions = _useState4[1];
  var _useState5 = (0, _react.useState)(false),
    _useState6 = (0, _slicedToArray2.default)(_useState5, 2),
    suggestionClicked = _useState6[0],
    setSuggestionClicked = _useState6[1];
  var _useState7 = (0, _react.useState)(0),
    _useState8 = (0, _slicedToArray2.default)(_useState7, 2),
    activeSuggestion = _useState8[0],
    setActiveSuggestion = _useState8[1];
  var _useState9 = (0, _react.useState)({
      auth: '',
      serviceId: ''
    }),
    _useState10 = (0, _slicedToArray2.default)(_useState9, 2),
    transliterationConfig = _useState10[0],
    setTransliterationConfig = _useState10[1];
  var handlePaste = (0, _react.useCallback)(function (e) {
    (0, _parseDataTransfer.default)(e, setPastedImage);
  }, []);
  var handleImageCancel = (0, _react.useCallback)(function () {
    setPastedImage(null);
  }, []);
  var handleImageSend = (0, _react.useCallback)(function () {
    if (onImageSend && pastedImage) {
      Promise.resolve(onImageSend(pastedImage)).then(function () {
        setPastedImage(null);
      });
    }
  }, [onImageSend, pastedImage]);
  (0, _react.useEffect)(function () {
    if (canTouch && inputRef.current) {
      var $composer = document.querySelector('.Composer');
      (0, _riseInput.default)(inputRef.current, $composer);
    }
  }, [inputRef]);
  (0, _react.useEffect)(function () {
    //@ts-ignore
    if (value && value.length > 0 && showTransliteration) {
      if (suggestionClicked) {
        setSuggestionClicked(false);
        return;
      }
      if (!sessionStorage.getItem('computeFetched')) {
        sessionStorage.setItem('computeFetched', 'true');
        fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ulcaApiKey: '13900b794f-49de-4b42-8ee5-6e0289fe8833',
            userID: '737078729ae04552822e4e7e3093575c'
          },
          body: JSON.stringify({
            pipelineTasks: [{
              taskType: 'transliteration',
              config: {
                language: {
                  sourceLanguage: 'en',
                  targetLanguage: 'or'
                }
              }
            }],
            pipelineRequestConfig: {
              pipelineId: '64392f96daac500b55c543cd'
            }
          })
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          var _data$pipelineRespons, _data$pipelineRespons2, _data$pipelineRespons3, _data$pipelineRespons4, _data$pipelineInferen, _data$pipelineInferen2;
          setTransliterationConfig({
            serviceId: data === null || data === void 0 ? void 0 : (_data$pipelineRespons = data.pipelineResponseConfig) === null || _data$pipelineRespons === void 0 ? void 0 : (_data$pipelineRespons2 = _data$pipelineRespons[0]) === null || _data$pipelineRespons2 === void 0 ? void 0 : (_data$pipelineRespons3 = _data$pipelineRespons2.config) === null || _data$pipelineRespons3 === void 0 ? void 0 : (_data$pipelineRespons4 = _data$pipelineRespons3[0]) === null || _data$pipelineRespons4 === void 0 ? void 0 : _data$pipelineRespons4.serviceId,
            auth: data === null || data === void 0 ? void 0 : (_data$pipelineInferen = data.pipelineInferenceAPIEndPoint) === null || _data$pipelineInferen === void 0 ? void 0 : (_data$pipelineInferen2 = _data$pipelineInferen.inferenceApiKey) === null || _data$pipelineInferen2 === void 0 ? void 0 : _data$pipelineInferen2.value
          });
        }).catch(function (error) {
          console.error('Error fetching models pipeline:', error);
        });
      }
      setSuggestions([]);

      //@ts-ignore
      var words = value.split(' ');
      var wordUnderCursor = words.find(function (word, index) {
        return (
          //@ts-ignore
          cursorPosition >= value.indexOf(word) && cursorPosition <= value.indexOf(word) + word.length
        );
      });
      if (!wordUnderCursor) return;
      fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          Accept: ' */*',
          'User-Agent': ' Thunder Client (https://www.thunderclient.com)',
          Authorization: transliterationConfig.auth || 'L6zgUQ59QzincUafIoc1pZ8m54-UfxRdDKTNb0bVUDjm6z6HbXi6Nv7zxIJ-UyQN',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pipelineTasks: [{
            taskType: 'transliteration',
            config: {
              language: {
                sourceLanguage: 'en',
                targetLanguage: 'or'
              },
              serviceId: transliterationConfig.serviceId || 'ai4bharat/indicxlit--cpu-fsv2',
              isSentence: false,
              numSuggestions: 5
            }
          }],
          inputData: {
            input: [{
              source: wordUnderCursor
            }]
          }
        })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        var _data$pipelineRespons5, _data$pipelineRespons6, _data$pipelineRespons7, _data$pipelineRespons8;
        setSuggestions(data === null || data === void 0 ? void 0 : (_data$pipelineRespons5 = data.pipelineResponse) === null || _data$pipelineRespons5 === void 0 ? void 0 : (_data$pipelineRespons6 = _data$pipelineRespons5[0]) === null || _data$pipelineRespons6 === void 0 ? void 0 : (_data$pipelineRespons7 = _data$pipelineRespons6.output) === null || _data$pipelineRespons7 === void 0 ? void 0 : (_data$pipelineRespons8 = _data$pipelineRespons7[0]) === null || _data$pipelineRespons8 === void 0 ? void 0 : _data$pipelineRespons8.target);
      }).catch(function (error) {
        console.error('Error fetching transliteration:', error);
      });
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, cursorPosition]);
  var suggestionClickHandler = (0, _react.useCallback)(function (e) {
    //@ts-ignore
    var words = value.split(' ');

    // Find the word at the cursor position
    var selectedWord = words.find(function (word, index) {
      return (
        //@ts-ignore
        cursorPosition >= value.indexOf(word) && cursorPosition <= value.indexOf(word) + word.length
      );
    });
    if (selectedWord) {
      // Replace the selected word with the transliterated suggestion
      //@ts-ignore
      var newInputMsg = value.replace(selectedWord, e);
      setSuggestions([]);
      setSuggestionClicked(true);
      setActiveSuggestion(0);

      // Save and restore the cursor position
      //@ts-ignore
      var restoredCursorPosition = cursorPosition - value.indexOf(selectedWord) + value.indexOf(e);
      //@ts-ignore
      onChange(newInputMsg, e);
      setCursorPosition(restoredCursorPosition);
      //@ts-ignore
      inputRef.current && inputRef.current.focus();
    }
  }, [value, cursorPosition, onChange]);
  var suggestionHandler = function suggestionHandler(e, index) {
    setActiveSuggestion(index);
  };
  var handleKeyDown = (0, _react.useCallback)(function (e) {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(function (prevActiveSuggestion) {
          return prevActiveSuggestion > 0 ? prevActiveSuggestion - 1 : prevActiveSuggestion;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(function (prevActiveSuggestion) {
          return prevActiveSuggestion < suggestions.length - 1 ? prevActiveSuggestion + 1 : prevActiveSuggestion;
        });
      } else if (e.key === ' ') {
        e.preventDefault();
        if (activeSuggestion >= 0 && activeSuggestion < (suggestions === null || suggestions === void 0 ? void 0 : suggestions.length)) {
          suggestionClickHandler(suggestions[activeSuggestion]);
          setSuggestions([]);
        } else {
          //@ts-ignore
          onChange(prevInputMsg + ' ');
        }
      }
    }
  }, [activeSuggestion, suggestionClickHandler, suggestions]);
  (0, _react.useEffect)(function () {
    if (suggestions.length === 1) {
      setSuggestions([]);
    }
  }, [suggestions]);
  (0, _react.useEffect)(function () {
    document.addEventListener('keydown', handleKeyDown);
    return function () {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.default)({
      'S--invisible': invisible
    })
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: 'suggestions'
  }, suggestions.map(function (elem, index) {
    return /*#__PURE__*/_react.default.createElement("div", {
      key: index,
      onClick: function onClick() {
        return suggestionClickHandler(elem);
      },
      className: "suggestion ".concat(activeSuggestion === index ? 'active' : ''),
      onMouseEnter: function onMouseEnter(e) {
        return suggestionHandler(e, index);
      }
    }, elem);
  })), /*#__PURE__*/_react.default.createElement(_Input.Input, (0, _extends2.default)({
    className: "Composer-input",
    rows: 1,
    autoSize: true,
    enterKeyHint: "send",
    onPaste: onImageSend ? handlePaste : undefined,
    ref: inputRef,
    disabled: disabled,
    value: value,
    onChange: onChange
  }, rest)), pastedImage && /*#__PURE__*/_react.default.createElement(_SendConfirm.SendConfirm, {
    file: pastedImage,
    onCancel: handleImageCancel,
    onSend: handleImageSend
  }));
};
exports.ComposerInput = ComposerInput;