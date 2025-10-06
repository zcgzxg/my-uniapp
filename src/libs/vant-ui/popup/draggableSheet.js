"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../common/utils");
/** 固定区域视图的类名 */
var FIXED_AREA_VIEW_CLASS = 'van-popup-draggable-sheet-view';
/** 三段式弹窗状态枚举 */
var DragPopupState;
(function (DragPopupState) {
    /** 未弹出状态 */
    DragPopupState["IDLE"] = "idle";
    /** 第一段（30%高度） */
    DragPopupState["FIRST_STEP"] = "first-step";
    /** 中间状态（55% 高度） */
    DragPopupState["NORMAL_STEP"] = "normal-step";
    /** 第三段（80% 高度） */
    DragPopupState["THIRD_STEP"] = "third-step";
    /** 完全弹出状态（全屏） */
    DragPopupState["FULL"] = "full";
})(DragPopupState || (DragPopupState = {}));
/** 最大可移动距离（单位：px） */
var MAX_MOVE_Y = 100;
/** 触发状态切换的移动距离阈值（单位：px） */
var TRIGGER_STATE_MOVE_Y = 50;
/** 拖动状态防抖时间（单位：ms） */
var DRAG_IDLE_TIME_MS = 50;
/** 触摸开始时的Y坐标 */
var touchStartY = 0;
/** 触摸开始时内容区域的高度 */
var originContentHeight = 0;
/** 触摸移动防抖标志 */
var touchIdle = false;
/** 处理弹窗状态切换的工具函数 */
var handlePopupState = function (currentState, newHeight, heights, triggerMoveY) {
    if (triggerMoveY === void 0) { triggerMoveY = TRIGGER_STATE_MOVE_Y; }
    var fortyPercentHeight = heights.fortyPercentHeight, sixtyPercentHeight = heights.sixtyPercentHeight, eightyPercentHeight = heights.eightyPercentHeight, maxHeight = heights.maxHeight;
    switch (currentState) {
        case DragPopupState.FIRST_STEP:
            if (newHeight > fortyPercentHeight + triggerMoveY) {
                return {
                    state: DragPopupState.NORMAL_STEP,
                    height: sixtyPercentHeight,
                };
            }
            else if (newHeight < fortyPercentHeight - triggerMoveY) {
                return {
                    state: DragPopupState.IDLE,
                    height: 0,
                    shouldClose: true,
                };
            }
            return { state: currentState, height: fortyPercentHeight };
        case DragPopupState.NORMAL_STEP:
            if (newHeight > sixtyPercentHeight + triggerMoveY) {
                return {
                    state: DragPopupState.THIRD_STEP,
                    height: eightyPercentHeight,
                };
            }
            else if (newHeight < sixtyPercentHeight - triggerMoveY) {
                return {
                    state: DragPopupState.FIRST_STEP,
                    height: fortyPercentHeight,
                };
            }
            return { state: currentState, height: sixtyPercentHeight };
        case DragPopupState.THIRD_STEP:
            if (newHeight > eightyPercentHeight + triggerMoveY) {
                return {
                    state: DragPopupState.FULL,
                    height: maxHeight,
                };
            }
            else if (newHeight < eightyPercentHeight - triggerMoveY) {
                return {
                    state: DragPopupState.NORMAL_STEP,
                    height: sixtyPercentHeight,
                };
            }
            return { state: currentState, height: eightyPercentHeight };
        case DragPopupState.FULL:
            if (newHeight < maxHeight - triggerMoveY) {
                return {
                    state: DragPopupState.THIRD_STEP,
                    height: eightyPercentHeight,
                };
            }
            return { state: currentState, height: maxHeight };
        default:
            return { state: currentState, height: newHeight };
    }
};
/** 限制高度在指定范围内的工具函数 */
var limitHeight = function (height, targetHeight, maxMoveY) {
    if (maxMoveY === void 0) { maxMoveY = MAX_MOVE_Y; }
    return height > targetHeight
        ? Math.min(height, targetHeight + maxMoveY)
        : Math.max(height, targetHeight - maxMoveY);
};
exports.default = Behavior({
    properties: {
        /** 是否启用三段式底部弹出层 */
        draggableSheet: Boolean,
    },
    data: {
        FIXED_AREA_VIEW_CLASS: FIXED_AREA_VIEW_CLASS,
        /** rpx与px的转换比例 */
        __rpx__: 1,
        /** 弹窗最大高度 */
        __maxHeight__: 0,
        /** 第一段高度 */
        __firstStepHeight__: 0,
        /** 中间段高度 */
        __normalStepHeight__: 0,
        /** 第三段高度 */
        __thirdStepHeight__: 0,
        /** 三段式弹窗状态 */
        __dragPopupState__: DragPopupState.IDLE,
        /** 内容区域高度 */
        __contentHeight__: 300,
        /** 固定区域高度 */
        __fixedAreaHeight__: 0,
        /** 设备信息 */
        __info__: {
            screenHeight: 0,
            windowWidth: 0,
            safeAreaBottom: 0,
            navbarBottom: 0,
        },
    },
    lifetimes: {
        attached: function () {
            if (this.properties.draggableSheet) {
                this.init();
            }
        },
    },
    methods: {
        /** 初始化弹窗配置
         * 计算设备信息、转换比例和弹窗高度
         */
        init: function () {
            var platform = wx.getDeviceInfo().platform;
            DRAG_IDLE_TIME_MS = platform === 'ios' ? 70 : 50;
            var _a = wx.getWindowInfo(), screenHeight = _a.screenHeight, windowWidth = _a.windowWidth, safeArea = _a.safeArea;
            // 计算rpx与px的转换比例
            var __rpx__ = windowWidth / 750;
            // 计算安全区域底部位置（预留8px间距）
            var safeAreaBottom = ((safeArea === null || safeArea === void 0 ? void 0 : safeArea.bottom) || 0) - 8;
            // 获取导航栏药丸按钮底部位置
            var navbarBottom = wx.getMenuButtonBoundingClientRect().bottom;
            // 计算弹窗最大高度（屏幕高度减去导航栏和底部安全区域）
            var __maxHeight__ = screenHeight - navbarBottom - (screenHeight - safeAreaBottom);
            // 计算半屏高度（最大高度的50%）
            var __normalStepHeight__ = __maxHeight__ * 0.45;
            this.setData({
                __rpx__: __rpx__,
                __maxHeight__: __maxHeight__,
                __normalStepHeight__: __normalStepHeight__,
                __contentHeight__: __normalStepHeight__,
                __info__: {
                    screenHeight: screenHeight,
                    windowWidth: windowWidth,
                    safeAreaBottom: safeAreaBottom,
                    navbarBottom: navbarBottom,
                },
            });
        },
        /** 获取弹窗固定区域的高度
         * 通过查询DOM获取所有固定区域视图的高度总和
         */
        getPopupViewHeight: function () {
            return __awaiter(this, void 0, void 0, function () {
                var rects, __fixedAreaHeight__;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, utils_1.getAllRect)(this, '.' + FIXED_AREA_VIEW_CLASS)];
                        case 1:
                            rects = _a.sent();
                            __fixedAreaHeight__ = rects.reduce(function (acc, rect) { return acc + rect.height; }, 0);
                            this.setData({
                                __fixedAreaHeight__: __fixedAreaHeight__,
                                __dragPopupState__: DragPopupState.NORMAL_STEP,
                                __contentHeight__: this.data.__normalStepHeight__,
                            });
                            return [2 /*return*/];
                    }
                });
            });
        },
        /** 初始化内容区域高度
         * 根据设备信息和固定区域高度计算内容区域的最大高度和半屏高度
         */
        initContentHeight: function () {
            var _a = this.data, __info__ = _a.__info__, __fixedAreaHeight__ = _a.__fixedAreaHeight__;
            var screenHeight = __info__.screenHeight, navbarBottom = __info__.navbarBottom, safeAreaBottom = __info__.safeAreaBottom;
            // 重新计算最大高度（考虑固定区域高度）
            var __maxHeight__ = screenHeight -
                navbarBottom -
                (screenHeight - safeAreaBottom) -
                __fixedAreaHeight__;
            // 计算各段高度
            var __firstStepHeight__ = __maxHeight__ * 0.3;
            var __normalStepHeight__ = __maxHeight__ * 0.55;
            var __thirdStepHeight__ = __maxHeight__ * 0.8;
            this.setData({
                __maxHeight__: __maxHeight__,
                __normalStepHeight__: __normalStepHeight__,
                __firstStepHeight__: __firstStepHeight__,
                __thirdStepHeight__: __thirdStepHeight__,
                __contentHeight__: __normalStepHeight__,
            });
        },
        /** 触摸开始事件处理
         * 记录触摸起始位置和初始高度，用于后续计算移动距离
         */
        onTouchStart: function (event) {
            // 记录触摸开始的Y坐标
            touchStartY = event.touches[0].clientY;
            // 记录当前内容区域的高度
            originContentHeight = this.data.__contentHeight__;
        },
        /** 触摸移动事件处理
         * 根据移动距离实时调整内容区域高度，并限制移动范围
         */
        onTouchMove: function (event) {
            if (touchIdle)
                return;
            touchIdle = true;
            var moveY = touchStartY - event.touches[0].clientY;
            var newHeight = originContentHeight + moveY;
            var _a = this.data, __firstStepHeight__ = _a.__firstStepHeight__, __normalStepHeight__ = _a.__normalStepHeight__, __thirdStepHeight__ = _a.__thirdStepHeight__, __dragPopupState__ = _a.__dragPopupState__, __maxHeight__ = _a.__maxHeight__;
            var __contentHeight__ = newHeight;
            switch (__dragPopupState__) {
                case DragPopupState.FIRST_STEP:
                    __contentHeight__ = limitHeight(newHeight, __firstStepHeight__);
                    break;
                case DragPopupState.NORMAL_STEP:
                    __contentHeight__ = limitHeight(newHeight, __normalStepHeight__);
                    break;
                case DragPopupState.THIRD_STEP:
                    __contentHeight__ = limitHeight(newHeight, __thirdStepHeight__);
                    break;
                case DragPopupState.FULL:
                    __contentHeight__ =
                        newHeight > __maxHeight__
                            ? __maxHeight__
                            : Math.max(newHeight, __maxHeight__ - MAX_MOVE_Y);
                    break;
            }
            this.setData({ __contentHeight__: __contentHeight__ });
            setTimeout(function () { return (touchIdle = false); }, DRAG_IDLE_TIME_MS);
        },
        /** 触摸结束事件处理
         * 根据最终移动距离决定是否切换弹窗状态
         */
        onTouchEnd: function (event) {
            var moveY = touchStartY - event.changedTouches[0].clientY;
            var newHeight = originContentHeight + moveY;
            var _a = this.data, __firstStepHeight__ = _a.__firstStepHeight__, __normalStepHeight__ = _a.__normalStepHeight__, __thirdStepHeight__ = _a.__thirdStepHeight__, __dragPopupState__ = _a.__dragPopupState__, __maxHeight__ = _a.__maxHeight__;
            var result = handlePopupState(__dragPopupState__, newHeight, {
                fortyPercentHeight: __firstStepHeight__,
                sixtyPercentHeight: __normalStepHeight__,
                eightyPercentHeight: __thirdStepHeight__,
                maxHeight: __maxHeight__,
            });
            if (result.shouldClose) {
                this.setData({
                    __contentHeight__: 0,
                    __dragPopupState__: DragPopupState.IDLE,
                    show: false,
                });
                // @ts-ignore
                this.$emit('close');
                // @ts-ignore
                this.$emit('close-drag');
            }
            else {
                this.setData({
                    __dragPopupState__: result.state,
                    __contentHeight__: result.height,
                });
            }
        },
    },
    observers: {
        /** 监听show属性变化
         * 当弹窗显示时，初始化弹窗高度和状态
         * @param newVal 新的show值
         * @param oldVal 旧的show值
         */
        show: function (newVal, oldVal) {
            var _this = this;
            // 仅在弹窗显示状态发生变化且启用了三段式弹窗时执行
            if (newVal && newVal !== oldVal && this.properties.draggableSheet) {
                // 延迟执行以确保DOM已更新
                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // 获取固定区域高度
                            return [4 /*yield*/, this.getPopupViewHeight()];
                            case 1:
                                // 获取固定区域高度
                                _a.sent();
                                // 初始化内容区域高度
                                setTimeout(function () { return _this.initContentHeight(); }, 50);
                                return [2 /*return*/];
                        }
                    });
                }); }, 100);
            }
        },
    },
});
