"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../common/component");
var button_1 = require("../mixins/button");
var displayModes = {
    'post-content': function (imageCount) {
        if (imageCount === 1) {
            return {
                containerWidth: 343 * 2,
                imageWidth: 343 * 2,
                imageHeight: 194 * 2,
                imageGap: 0,
                imageCount: 1,
            };
        }
        if (imageCount === 2 || imageCount === 4) {
            return {
                containerWidth: 343 * 2,
                imageWidth: 169 * 2,
                imageHeight: 169 * 2,
                imageGap: 5 * 2,
                imageCount: 2,
            };
        }
        return {
            containerWidth: 343 * 2,
            imageWidth: 111 * 2,
            imageHeight: 111 * 2,
            imageGap: 10,
            imageCount: 3,
        };
    },
    'thread-record': function (imageCount) {
        if (imageCount === 1) {
            return {
                containerWidth: 148 * 2,
                imageWidth: 148 * 2,
                imageHeight: 148 * 2,
                imageGap: 0,
                imageCount: 1,
            };
        }
        if (imageCount === 2 || imageCount === 4) {
            return {
                containerWidth: 297 * 2,
                imageWidth: 146 * 2,
                imageHeight: 146 * 2,
                imageGap: 5 * 2,
                imageCount: 2,
            };
        }
        return {
            containerWidth: 297 * 2,
            imageWidth: 96 * 2,
            imageHeight: 96 * 2,
            imageGap: 5 * 2,
            imageCount: 3,
        };
    },
    comment: function (imageCount) {
        if (imageCount === 1) {
            return {
                containerWidth: 136 * 2,
                imageWidth: 136 * 2,
                imageHeight: 136 * 2,
                imageGap: 0,
                imageCount: 1,
            };
        }
        if (imageCount === 2 || imageCount === 4) {
            return {
                containerWidth: 277 * 2,
                imageWidth: 136 * 2,
                imageHeight: 136 * 2,
                imageGap: 5 * 2,
                imageCount: 2,
            };
        }
        return {
            containerWidth: 277 * 2,
            imageWidth: 89 * 2,
            imageHeight: 89 * 2,
            imageGap: 5 * 2,
            imageCount: 3,
        };
    },
};
(0, component_1.VantComponent)({
    mixins: [button_1.button],
    classes: ['custom-class'],
    props: {
        images: {
            type: Array,
            value: [],
            observer: function (images) {
                this.setData({
                    displayRule: displayModes[this.data.displayMode](images.length),
                });
            },
        },
        displayMode: {
            type: String,
            value: 'post-content',
        },
        thumbKey: {
            type: String,
            value: 'InsetUrl',
        },
        originalKey: {
            type: String,
            value: 'Url',
        },
        disablePreview: {
            type: Boolean,
            value: false,
        },
        lazyLoad: {
            type: Boolean,
            value: true,
        },
        showMenuByLongpress: Boolean,
        fit: {
            type: String,
            value: 'cover',
        },
        webp: {
            type: Boolean,
            value: true,
        },
        showError: {
            type: Boolean,
            value: true,
        },
        showLoading: {
            type: Boolean,
            value: true,
        },
    },
    data: {
        displayRule: {
            containerWidth: 0,
            imageWidth: 0,
            imageHeight: 0,
            imageGap: 0,
            imageCount: 0,
        },
    },
    methods: {
        onError: function (event) {
            var index = event.currentTarget.dataset.index;
            this.$emit('error', { index: index, error: event.detail });
        },
        onLoaded: function (event) {
            var index = event.currentTarget.dataset.index;
            this.$emit('load', { index: index });
        },
        onClick: function (event) {
            var _this = this;
            var index = event.currentTarget.dataset.index;
            if (!this.data.disablePreview) {
                wx.previewImage({
                    urls: this.data.images.map(function (item) { return item[_this.data.originalKey]; }),
                    current: this.data.images[index][this.data.originalKey],
                });
            }
            this.$emit('click', { index: index });
        },
    },
});
