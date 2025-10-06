"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../common/component");
var utils_1 = require("../common/utils");
(0, component_1.VantComponent)({
    classes: ['title-class'],
    props: {
        title: String,
        fixed: {
            type: Boolean,
            observer: 'setHeight',
        },
        placeholder: {
            type: Boolean,
            value: true,
            observer: 'setHeight',
        },
        leftText: String,
        rightText: String,
        customStyle: String,
        leftArrow: Boolean,
        /** 是否根据页面栈自动将左箭头替换为home图标 */
        autoLeftArrow: {
            type: Boolean,
            value: true,
        },
        /** 是否开启滑动透明背景 */
        transition: Boolean,
        border: {
            type: Boolean,
            value: true,
        },
        zIndex: {
            type: Number,
            value: 1,
        },
        safeAreaInsetTop: {
            type: Boolean,
            value: true,
        },
    },
    data: {
        height: 46,
        navHeight: 0,
        /** 导航栏内容高度 */
        navbarDivHeight: 0,
        /** 导航栏内容标题宽度 */
        navbarDivTitleWidth: 0,
        transparentBackground: false,
        hasInit: false,
        hasBack: false,
    },
    created: function () {
        var _this = this;
        var pages = getCurrentPages();
        var _a = (0, utils_1.getSystemInfoSync)(), statusBarHeight = _a.statusBarHeight, windowWidth = _a.windowWidth;
        var menuInfo = wx.getMenuButtonBoundingClientRect();
        // 菜单按钮距离顶部的高度
        var menuMargin = menuInfo.top - statusBarHeight;
        // 导航栏内容高度
        var navbarDivHeight = menuInfo.height + 2 * menuMargin;
        // 导航栏内容标题宽度
        var navbarDivTitleWidth = windowWidth - 2 * (windowWidth - menuInfo.left + menuMargin);
        this.setData({
            statusBarHeight: statusBarHeight,
            height: menuInfo.bottom + menuMargin,
            navbarDivHeight: navbarDivHeight,
            navbarDivTitleWidth: navbarDivTitleWidth,
            hasBack: this.properties.autoLeftArrow ? pages.length > 1 : true,
            transparentBackground: this.properties.transition,
        });
        setTimeout(function () { return _this.setData({ hasInit: true }); }, 400);
    },
    mounted: function () {
        var _this = this;
        this.setHeight();
        if (this.properties.transition) {
            wx.createSelectorQuery()
                .in(this)
                .select('#van-nav-bar')
                .boundingClientRect(function (rect) {
                _this.setData({ navHeight: rect.height });
                _this.triggerEvent('height', rect.height);
                setTimeout(function () {
                    _this.transparentObserver();
                }, 10);
            })
                .exec();
        }
    },
    methods: {
        onClickLeft: function () {
            this.$emit('click-left');
            this.$emit(this.data.hasBack ? 'back' : 'back-home');
        },
        onClickRight: function () {
            this.$emit('click-right');
        },
        setHeight: function () {
            var _this = this;
            if (!this.data.fixed || !this.data.placeholder) {
                return;
            }
            wx.nextTick(function () {
                (0, utils_1.getRect)(_this, '.van-nav-bar').then(function (res) {
                    if (res && 'height' in res) {
                        _this.setData({ height: res.height });
                    }
                });
            });
        },
        /** 透明背景处理 */
        transparentObserver: function () {
            var _this = this;
            // 透明背景
            if (this.properties.transition) {
                this.triggerEvent('transparent', true);
                // 创建一个交叉观察器实例
                var observer = wx.createIntersectionObserver(this);
                this.data._observerInstance = observer;
                // 监听页面滚动事件
                observer
                    .relativeToViewport()
                    .observe('#van-nav-bar__transition-bar', function (_a) {
                    var intersectionRatio = _a.intersectionRatio;
                    // 在这里可以获取到滚动数据，如滚动位置等
                    var transparentBackground = intersectionRatio > 0;
                    _this.setData({ transparentBackground: transparentBackground });
                    _this.triggerEvent('transparent', transparentBackground);
                });
            }
        },
    },
});
