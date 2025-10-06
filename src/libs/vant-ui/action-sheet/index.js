"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../common/component");
var button_1 = require("../mixins/button");
(0, component_1.VantComponent)({
    classes: ['list-class'],
    mixins: [button_1.button],
    props: {
        show: Boolean,
        title: String,
        description: String,
        round: {
            type: Boolean,
            value: true,
        },
        zIndex: {
            type: Number,
            value: 100,
        },
        actions: {
            type: Array,
            value: [],
        },
        overlay: {
            type: Boolean,
            value: true,
        },
        closeOnClickOverlay: {
            type: Boolean,
            value: true,
        },
        closeOnClickAction: {
            type: Boolean,
            value: true,
        },
        rootPortal: {
            type: Boolean,
            value: false,
        },
        showFooter: {
            type: Boolean,
            value: false,
        },
        showConfirmBtn: {
            type: Boolean,
            value: false,
        },
        cancelText: {
            type: String,
            value: '',
        },
        confirmText: {
            type: String,
            value: '',
        },
    },
    data: {
        originalActions: [],
        activeIndex: -1,
    },
    methods: {
        onSelect: function (event) {
            var _this = this;
            var index = event.currentTarget.dataset.index;
            var _a = this.data, actions = _a.actions, closeOnClickAction = _a.closeOnClickAction, canIUseGetUserProfile = _a.canIUseGetUserProfile, showConfirmBtn = _a.showConfirmBtn;
            var item = actions[index];
            if (item) {
                if (showConfirmBtn) {
                    this.setData({
                        activeIndex: index,
                    });
                }
                this.$emit('select', item);
                if (closeOnClickAction && !showConfirmBtn) {
                    this.onClose();
                }
                if (item.openType === 'getUserInfo' && canIUseGetUserProfile) {
                    wx.getUserProfile({
                        desc: item.getUserProfileDesc || '  ',
                        complete: function (userProfile) {
                            _this.$emit('getuserinfo', userProfile);
                        },
                    });
                }
            }
        },
        onClose: function () {
            if (this.data.showConfirmBtn) {
                this.setData({
                    activeIndex: -1,
                });
            }
            this.$emit('close');
        },
        onCancel: function () {
            this.$emit('cancel');
            this.onClose();
        },
        onConfirm: function () {
            this.$emit('confirm');
        },
        onClickOverlay: function () {
            this.$emit('click-overlay');
            this.onClose();
        },
    },
});
