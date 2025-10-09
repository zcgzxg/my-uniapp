Component({
  properties: {
    maskClosable: {
      type: Boolean,
      value: true
    },
    mask: {
      type: Boolean,
      value: true
    }
  },
  data: {
    _change_color_picker_callback: null,
    _shouldChangeSV: false,
    hasAlpha: false,
    show: false,
    alpha: 100,
    inputColor: '',
    presetColorList: []
  },
  lifetimes: {
    ready() {
      this.initSV()
    }
  },
  methods: {
    initSV(fn) {
      const $ = this.createSelectorQuery()
      const target = $.select('.target')
      target.boundingClientRect()
      $.exec((res) => {
        const rect = res[0]
        if (rect) {
          this.SV = {
            W: rect.width - 28, // block-size=28
            H: rect.height - 28,
            Step: (rect.width - 28) / 100
          }
          fn && fn()
        }
      })
    },
    openColorPicker(options, changeColorCallback) {
      this.data._shouldChangeSV = false
      const { initColor, hasAlpha = false, presetColorList = [] } = options
      this.data._change_color_picker_callback = changeColorCallback

      this.initSV(() => {
        this.setData({ presetColorList, hasAlpha })

        this.initColor(initColor)

      })
    },
    initColor(color) {
      const initColor = color || '#3A85F4'
      const { r, g, b, alpha } = this.hexToRgba(initColor)
      const hueColor = 'rgb(' + r + "," + g + "," + b + ')'
      const { h, s, v } = this.rgb2hsv(hueColor)

      // 初始化定位
      this.setData({
        hsv: { h, s, v },
        hueColor: (r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255) ? 'rgb(255,0,0)' : hueColor,
        alpha,
        x: Math.round(s * this.SV.Step),
        y: Math.round((100 - v) * this.SV.Step),
        currentColor: initColor,
        inputColor: initColor,
        show: true
      }, () => {
        this.data._shouldChangeSV = true
      })
    },
    areaTap(res) {
      const $ = this.createSelectorQuery()
      const target = $.select('.target')
      target.boundingClientRect()
      $.exec((r) => {
        const rect = r[0]
        if (rect) {
          // 修正浮标位置, 魔法数字`-14`：去除半个浮标的宽度
          this.setData({
            x: res.detail.x - rect.left - 14,
            y: res.detail.y - rect.top - 14
          })

          this.changeSV({
            detail: {
              x: this.data.x,
              y: this.data.y
            }
          })
        }
      })
    },
    changeHue(e) {
      let hue = e.detail.value;
      const { r, g, b } = this.hsv2rgb(hue, 100, 100)
      const hsvRgb = this.hsv2rgb(hue, this.data.hsv.s, this.data.hsv.v)

      this.setData({
        "hsv.h": hue,
        hueColor: 'rgb(' + r + "," + g + "," + b + ')',
        colorRes: 'rgb(' + hsvRgb.r + "," + hsvRgb.g + "," + hsvRgb.b + ')'
      })

      this.updateCurrentColor()
    },
    changeAlpha(e) {
      const alpha = e.detail.value
      this.setData({ alpha })
      this.updateCurrentColor()
    },
    changeSV(e) {
      if (!this.data._shouldChangeSV) {
        return
      }

      let {
        x,
        y
      } = e.detail;
      x = Math.min(Math.round(x / this.SV.Step), 100);
      y = 100 - Math.round(y / this.SV.Step);

      const { r, g, b } = this.hsv2rgb(this.data.hsv.h, x, y)
      this.setData({
        "hsv.s": x,
        "hsv.v": y,
        colorRes: 'rgb(' + r + "," + g + "," + b + ')'
      })

      this.updateCurrentColor()
    },
    close() {
      if (this.data.maskClosable) {
        this.setData({ show: false });
      }
    },
    handlePresetColor(e) {
      this.initColor(e.currentTarget.dataset.color)
    },
    handleConfirm() {
      // const { r, g, b } = this.hsv2rgb(this.data.hsv.h, this.data.hsv.s, this.data.hsv.v)
      // const color = this.rgbaToHex(r, g, b)
      const updateFn = this.data._change_color_picker_callback

      if (updateFn && typeof updateFn === 'function') {
        updateFn(this.data.currentColor)
      }
      this.setData({ show: false });
    },
    handleCancel() {
      this.setData({ show: false });
    },
    preventdefault() {

    },
    hsv2rgb(h, s, v) {
      let hsv_h = (h / 360).toFixed(2);
      let hsv_s = (s / 100).toFixed(2);
      let hsv_v = (v / 100).toFixed(2);

      var i = Math.floor(hsv_h * 6);
      var f = hsv_h * 6 - i;
      var p = hsv_v * (1 - hsv_s);
      var q = hsv_v * (1 - f * hsv_s);
      var t = hsv_v * (1 - (1 - f) * hsv_s);

      var rgb_r = 0,
        rgb_g = 0,
        rgb_b = 0;
      switch (i % 6) {
        case 0:
          rgb_r = hsv_v;
          rgb_g = t;
          rgb_b = p;
          break;
        case 1:
          rgb_r = q;
          rgb_g = hsv_v;
          rgb_b = p;
          break;
        case 2:
          rgb_r = p;
          rgb_g = hsv_v;
          rgb_b = t;
          break;
        case 3:
          rgb_r = p;
          rgb_g = q;
          rgb_b = hsv_v;
          break;
        case 4:
          rgb_r = t;
          rgb_g = p;
          rgb_b = hsv_v;
          break;
        case 5:
          rgb_r = hsv_v, rgb_g = p, rgb_b = q;
          break;
      }

      return {
        r: Math.round(rgb_r * 255),
        g: Math.round(rgb_g * 255),
        b: Math.round(rgb_b * 255)
      }
    },
    rgb2hsv(color) {
      let rgb = color.split(',');
      let R = parseInt(rgb[0].split('(')[1]);
      let G = parseInt(rgb[1]);
      let B = parseInt(rgb[2].split(')')[0]);

      let hsv_red = R / 255, hsv_green = G / 255, hsv_blue = B / 255;
      let hsv_max = Math.max(hsv_red, hsv_green, hsv_blue),
        hsv_min = Math.min(hsv_red, hsv_green, hsv_blue);
      let hsv_h, hsv_s, hsv_v = hsv_max;

      let hsv_d = hsv_max - hsv_min;
      hsv_s = hsv_max == 0 ? 0 : hsv_d / hsv_max;

      if (hsv_max == hsv_min) hsv_h = 0;
      else {
        switch (hsv_max) {
          case hsv_red:
            hsv_h = (hsv_green - hsv_blue) / hsv_d + (hsv_green < hsv_blue ? 6 : 0);
            break;
          case hsv_green:
            hsv_h = (hsv_blue - hsv_red) / hsv_d + 2;
            break;
          case hsv_blue:
            hsv_h = (hsv_red - hsv_green) / hsv_d + 4;
            break;
        }
        hsv_h /= 6;
      }
      return {
        h: (hsv_h * 360).toFixed(),
        s: (hsv_s * 100).toFixed(),
        v: (hsv_v * 100).toFixed()
      }
    },
    /**hex颜色格式转rgba */
    hexToRgba(hex) {
      // 移除可能的井号 (#)
      hex = hex.replace('#', '');

      // 检查HEX颜色的长度是否合法（3位或6位）
      if (hex.length !== 3 && hex.length !== 6 && hex.length !== 4 && hex.length !== 8) {
        throw new Error('Invalid HEX color format');
      }

      // 如果是3位的简写形式，重复每个字符以扩展到6位
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + 'FF';
      } else if (hex.length === 6) {
        hex = hex + 'FF';
      } else if (hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }

      // 解析HEX字符串为RGB值
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const alpha = parseInt(parseInt(hex.substring(6, 8), 16) * 100 / 255);


      return { r, g, b, alpha };
    },
    /**rgba颜色格式转hex */
    rgbaToHex(r, g, b) {

      let hex = ((r << 16) | (g << 8) | b).toString(16)
      if (hex.length < 6) {
        hex = `${'0'.repeat(6 - hex.length)}${hex}`
      }
      if (hex == '0') {
        hex = '000000'
      }

      if (this.data.hasAlpha) {
        const alpha = (this.data.alpha !== null && this.data.alpha !== undefined) ? this.data.alpha : 100
        const hexA = Math.round(Math.max(0, Math.min(100, alpha)) * 255 / 100).toString(16).padStart(2, '0');
        return `#${hex}${hexA}`.toUpperCase()
      }

      return `#${hex}`.toUpperCase()
    },
    updateCurrentColor() {
      const hsv = this.data.hsv
      const { r, g, b } = this.hsv2rgb(hsv.h, hsv.s, hsv.v)


      const currentColor = this.rgbaToHex(r, g, b)

      this.setData({ currentColor, inputColor: currentColor })
    },
    changeInputColor(e) {
      const value = e.detail.value
      const [err, currentColor] = this.validHex(value)

      if (!err) {
        const { r, g, b, alpha } = this.hexToRgba(currentColor)
        const hueColor = 'rgb(' + r + "," + g + "," + b + ')'
        const { h, s, v } = this.rgb2hsv(hueColor)

        this.data._shouldChangeSV = false
        // 初始化定位
        this.setData({
          hsv: { h, s, v },
          hueColor,
          alpha,
          x: Math.round(s * this.SV.Step),
          y: Math.round((100 - v) * this.SV.Step),
          currentColor,
          inputColor: value
        }, () => {
          setTimeout(() => {
            this.data._shouldChangeSV = true
          }, 30)
        })
      } else {
        this.setData({ inputColor: /^#([0-9A-Fa-f]{0,8})$/.test(value) ? value : this.data.inputColor })
      }

    },
    validHex(color) {
      const Hex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;   // 匹配 Hex (3或6位)
      const HexA = /^#([0-9A-Fa-f]{4}|[0-9A-Fa-f]{8})$/; // 匹配 HexA (4或8位)
      const hasAlpha = this.data.hasAlpha

      const formateColor = (color) => {
        let hex = color.slice(1)
        if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + 'FF';
        } else if (hex.length === 6) {
          hex = hex + 'FF';
        } else if (hex.length === 4) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }

        return '#' + (hasAlpha ? hex : hex.slice(0, 6))
      }

      return (hasAlpha ? Hex.test(color) || HexA.test(color) : Hex.test(color))
        ? [false, formateColor(color)]
        : [true,]
    }
  },
})
