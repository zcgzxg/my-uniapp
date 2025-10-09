"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../common/utils");
var component_1 = require("../common/component");
var props_1 = require("./props");
function throttle(fn, wait) {
    var previous = 0;
    var timeout = null;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var now = Date.now();
        var remaining = wait - (now - previous);
        if (remaining <= 0) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            fn.apply(this, args);
        }
        else if (!timeout) {
            timeout = setTimeout(function () {
                previous = Date.now();
                timeout = null;
                fn.apply(_this, args);
            }, remaining);
        }
    };
}
(0, component_1.VantComponent)({
    options: {
        pureDataPattern: /^_/,
    },
    field: true,
    classes: ['input-class', 'right-icon-class', 'label-class'],
    props: __assign(__assign(__assign(__assign({}, props_1.commonProps), props_1.inputProps), props_1.textareaProps), { size: String, icon: String, label: String, error: Boolean, center: Boolean, isLink: Boolean, leftIcon: String, rightIcon: String, autosize: null, required: Boolean, iconClass: String, clickable: Boolean, inputAlign: String, customStyle: String, errorMessage: String, arrowDirection: String, showWordLimit: Boolean, errorMessageAlign: String, readonly: {
            type: Boolean,
            observer: 'setShowClear',
        }, clearable: {
            type: Boolean,
            observer: 'setShowClear',
        }, clearTrigger: {
            type: String,
            value: 'focus',
        }, border: {
            type: Boolean,
            value: true,
        }, titleWidth: {
            type: String,
            value: '6.2em',
        }, clearIcon: {
            type: String,
            value: 'clear',
        }, extraEventParams: {
            type: Boolean,
            value: false,
        }, 
        /** 辅助文本 */
        helperText: {
            type: String,
            value: '',
        }, 
        /** 输入框的样式 underline=输入线模式，filled=输入框模式 */
        variant: {
            type: String,
            value: 'underline',
        } }),
    data: {
        uiCache: {
            fontSize: 15,
            slotSize: 28,
            maxSingleWidthLimit: 0,
        },
        hiddenHeight: 0,
        _ctx: null,
        focused: false,
        innerValue: '',
        showClear: false,
        /** 输入框是否聚焦 */
        lineFocused: false,
    },
    watch: {
        value: function (value) {
            if (value !== this.value) {
                this.setData({ innerValue: value });
                this.value = value;
                this.setShowClear();
            }
        },
        clearTrigger: function () {
            this.setShowClear();
        },
    },
    created: function () {
        var _this = this;
        this.value = this.data.value;
        this.setData({ innerValue: this.value });
        if (this.data.useTextAreaSlot) {
            if (!this.data.uiCache.width) {
                this.createSelectorQuery()
                    .select(".".concat(this.data.name, "-r-textarea"))
                    .boundingClientRect(function (rect) {
                    _this.setData({
                        uiCache: {
                            width: rect.width,
                            fontSize: _this.data.slotFontSize,
                            maxSingleWidthLimit: rect.width - _this.data.otherCalc,
                            slotSize: _this.data.slotSize,
                        },
                    });
                })
                    .exec();
            }
        }
    },
    methods: {
        getWrappedLines: function (text, font, maxWidth) {
            if (!this.data._ctx) {
                var ctx = wx.createCanvasContext('van-circle', this);
                this.setData({ _ctx: ctx });
            }
            this.data._ctx.font = font;
            var lines = [];
            var currentLine = '';
            // 逐个字符进行遍历，这是处理中英文混排的关键
            for (var i = 0; i < text.length; i++) {
                var char = text[i];
                var testLine = currentLine + char;
                // 使用 measureText 测量添加新字符后的宽度
                var testLineWidth = this.data._ctx.measureText(testLine).width;
                // 如果超出最大宽度，将当前行保存，并以新字符开始新行
                if (testLineWidth > maxWidth) {
                    lines.push(currentLine);
                    currentLine = char;
                }
                else {
                    // 否则继续追加
                    currentLine = testLine;
                }
            }
            // 添加最后一行的文本（或唯一的一行）
            if (currentLine !== '') {
                lines.push(currentLine);
            }
            return lines;
        },
        getLastLineWidth: function (text, font, containerWidth) {
            var lines = this.getWrappedLines(text, font, containerWidth);
            if (lines.length === 0) {
                return 0;
            }
            var lastLine = lines[lines.length - 1];
            if (!this.data._ctx) {
                var ctx = wx.createCanvasContext('van-circle', this);
                this.setData({ _ctx: ctx });
            }
            this.data._ctx.font = font;
            return {
                width: this.data._ctx.measureText(lastLine).width,
                lines: lines,
            };
        },
        formatValue: function (value) {
            var maxlength = this.data.maxlength;
            if (maxlength !== -1 && value.length > maxlength) {
                return value.slice(0, maxlength);
            }
            return value;
        },
        onInput: function (event) {
            var _a = (event.detail || {}).value, value = _a === void 0 ? '' : _a;
            var formatValue = this.formatValue(value);
            this.value = formatValue;
            this.setShowClear();
            return this.emitChange(__assign(__assign({}, event.detail), { value: formatValue }));
        },
        onFocus: function (event) {
            this.focused = true;
            this.setShowClear();
            this.setData({ lineFocused: true });
            this.$emit('focus', event.detail);
        },
        onBlur: function (event) {
            this.focused = false;
            this.setShowClear();
            this.setData({ lineFocused: false });
            this.$emit('blur', event.detail);
        },
        onClickIcon: function () {
            this.$emit('click-icon');
        },
        onClickInput: function (event) {
            this.$emit('click-input', event.detail);
        },
        onClear: function () {
            var _this = this;
            this.setData({ innerValue: '' });
            this.value = '';
            this.setShowClear();
            (0, utils_1.nextTick)(function () {
                _this.emitChange({ value: '' });
                _this.$emit('clear', '');
            });
        },
        onConfirm: function (event) {
            var _a = (event.detail || {}).value, value = _a === void 0 ? '' : _a;
            this.value = value;
            this.setShowClear();
            this.$emit('confirm', value);
        },
        setValue: function (value) {
            this.value = value;
            this.setShowClear();
            if (value === '') {
                this.setData({ innerValue: '' });
            }
            this.emitChange({ value: value });
        },
        onLineChange: function (event) {
            this.$emit('linechange', event.detail);
        },
        onKeyboardHeightChange: function (event) {
            this.$emit('keyboardheightchange', event.detail);
        },
        onBindNicknameReview: function (event) {
            this.$emit('nicknamereview', event.detail);
        },
        _throttledSetHiddenHeight: throttle(function () {
            if (this.data.useTextAreaSlot &&
                this.data.uiCache.maxSingleWidthLimit &&
                this.data.uiCache.slotSize) {
                var needAddHeight = false;
                var fontStyle = "".concat(this.data.uiCache.fontSize, "px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,\n    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',\n    sans-serif");
                var _a = this.getLastLineWidth(this.data.value, fontStyle, this.data.uiCache.maxSingleWidthLimit), lastLineWidth = _a.width, lines = _a.lines;
                var cWidth = this.data.uiCache.maxSingleWidthLimit -
                    this.data.uiCache.slotSize * 1;
                if (lastLineWidth >= cWidth &&
                    lastLineWidth < this.data.uiCache.maxSingleWidthLimit) {
                    needAddHeight = true;
                }
                else {
                    needAddHeight = false;
                }
                if (lines) {
                    if (needAddHeight) {
                        this.setData({
                            hiddenHeight: this.data.slotLineHeight * (lines.length + 1),
                        });
                    }
                    else {
                        this.setData({
                            hiddenHeight: this.data.slotLineHeight * lines.length,
                        });
                    }
                }
                else {
                    this.setData({ hiddenHeight: this.data.slotLineHeight * 1 });
                }
            }
        }, 30),
        setHiddenHeight: function (value) {
            this._throttledSetHiddenHeight(value);
        },
        emitChange: function (detail) {
            var extraEventParams = this.data.extraEventParams;
            this.setData({ value: detail.value });
            this.setHiddenHeight(this.data.value);
            var result;
            var data = extraEventParams
                ? __assign(__assign({}, detail), { callback: function (data) {
                        result = data;
                    } }) : detail.value;
            this.$emit('input', data);
            this.$emit('change', data);
            return result;
        },
        setShowClear: function () {
            var _a = this.data, clearable = _a.clearable, readonly = _a.readonly, clearTrigger = _a.clearTrigger;
            var _b = this, focused = _b.focused, value = _b.value;
            var showClear = false;
            if (clearable && !readonly) {
                var hasValue = !!value;
                var trigger = clearTrigger === 'always' || (clearTrigger === 'focus' && focused);
                showClear = hasValue && trigger;
            }
            this.setView({ showClear: showClear });
        },
        noop: function () { },
    },
});
