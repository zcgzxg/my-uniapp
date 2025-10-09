"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../common/component");
var transition_1 = require("../mixins/transition");
var draggableSheet_1 = __importDefault(require("./draggableSheet"));
(0, component_1.VantComponent)({
    classes: [
        'enter-class',
        'enter-active-class',
        'enter-to-class',
        'leave-class',
        'leave-active-class',
        'leave-to-class',
        'close-icon-class',
    ],
    mixins: [(0, transition_1.transition)(false), draggableSheet_1.default],
    props: {
        round: Boolean,
        closeable: Boolean,
        customStyle: String,
        overlayStyle: String,
        /** 标题 */
        title: String,
        transition: {
            type: String,
            observer: 'observeClass',
        },
        zIndex: {
            type: Number,
            value: 100,
        },
        overlay: {
            type: Boolean,
            value: true,
        },
        closeIcon: {
            type: String,
            value: 'cross',
        },
        closeIconPosition: {
            type: String,
            value: 'top-right',
        },
        closeOnClickOverlay: {
            type: Boolean,
            value: true,
        },
        position: {
            type: String,
            value: 'center',
            observer: 'observeClass',
        },
        /** 确认按钮文字 */
        confirmButtonText: String,
        /** 取消按钮文字 */
        cancelButtonText: String,
        /** 点击取消按钮关闭弹窗 */
        cancelClose: {
            type: Boolean,
            value: true,
        },
        safeAreaInsetBottom: {
            type: Boolean,
            value: true,
        },
        safeAreaInsetTop: {
            type: Boolean,
            value: false,
        },
        safeAreaTabBar: {
            type: Boolean,
            value: false,
        },
        lockScroll: {
            type: Boolean,
            value: true,
        },
        rootPortal: {
            type: Boolean,
            value: false,
        },
    },
    created: function () {
        this.observeClass();
    },
    methods: {
        onClickCloseIcon: function () {
            this.$emit('close');
        },
        onClickOverlay: function () {
            this.$emit('click-overlay');
            if (this.data.closeOnClickOverlay) {
                this.$emit('close');
            }
        },
        /** 点击确认按钮 */
        onClickConfirmButton: function () {
            this.$emit('confirm');
        },
        /** 点击取消按钮 */
        onClickCancelButton: function () {
            this.$emit('cancel');
            if (this.data.cancelClose) {
                this.$emit('close');
            }
        },
        observeClass: function () {
            var _a = this.data, transition = _a.transition, position = _a.position, duration = _a.duration;
            var updateData = {
                name: transition || position,
            };
            if (transition === 'none') {
                updateData.duration = 0;
                this.originDuration = duration;
            }
            else if (this.originDuration != null) {
                updateData.duration = this.originDuration;
            }
            this.setData(updateData);
        },
    },
});
