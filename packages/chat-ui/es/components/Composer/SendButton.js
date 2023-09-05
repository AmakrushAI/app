import React from 'react';
import { Button } from '../Button';
import { useLocale } from '../LocaleProvider';
import SendIcon from './sendIcon';
export var SendButton = function SendButton(_ref) {
  var disabled = _ref.disabled,
    onClick = _ref.onClick,
    btnColor = _ref.btnColor;
  var _useLocale = useLocale('Composer'),
    trans = _useLocale.trans;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    className: "Composer-sendBtn",
    disabled: disabled,
    onMouseDown: onClick,
    color: "primary",
    btnColor: btnColor
  }, /*#__PURE__*/React.createElement(SendIcon, null)));
};