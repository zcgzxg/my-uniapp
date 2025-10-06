const choose_year = null
const choose_month = null
let timer = null

Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    workerClockData: {
      type: Array,
      observer: function (newVal, oldVal, changedPath) {}
    },
    initDay: {
      type: String,
      observer: function (newVal, oldVal) {
        if (newVal && (newVal !== oldVal)) {
          console.log(newVal)
          this.getinit(newVal)
        }
      }
    }
  },
  lifetimes: {
    ready() {
      this.getinit()
    }
  },
  data: {
    day: '',
    year: '',
    month: '',
    date: '',
    today: '',
    week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    calendar: {
      first: [],
      second: [],
      third: [],
      fourth: []
    },
    swiperMap: ['first', 'second', 'third', 'fourth'],
    swiperIndex: 1,
    showCalendar: false,
    swiperHeight: 300
  },
  methods: {
    getinit(initDay) {
      // 初始化，不传initDay则基于今天初始化，传其他日期则基于其他日期初始化
      const date = initDay ? new Date(initDay) : new Date()
      const month = this.formatMonth(date.getMonth() + 1)
      const year = String(date.getFullYear())
      const day = this.formatDay(date.getDate())
      const showDay = date.getDate()
      const today = `${year}-${month}-${day}`
      const calendar = this.generateThreeMonths(year, month)
      this.setData({
        calendar,
        month,
        year,
        day,
        showDay,
        today,
        beSelectDate: initDay ? initDay: today,
        date: `${year}-${month}`
      })
      setTimeout(() => {
        const query = wx.createSelectorQuery().in(this)
        query.selectAll('.calendar-item').boundingClientRect(rects => {
            const heights = rects.map(it => it.height)
            let swiperHeight = heights[1]
            this.setData({
              swiperHeight
            })
          })
          .exec()
      }, 100)
    },
    showCalendar() {
      this.setData({
        showCalendar: !this.data.showCalendar
      })
    },
    /**
     *
     * 左右滑动
     * @param {any} e
     */
    swiperChange(e) {
      const lastIndex = this.data.swiperIndex
      const currentIndex = e.detail.current

      let flag = false
      let {
        year,
        month,
        day,
        today,
        date,
        calendar,
        swiperMap
      } = this.data
      const change = swiperMap[(lastIndex + 2) % 4]
      let time = this.countMonth(year, month)
      let key = 'lastMonth'
      if (lastIndex > currentIndex) {
        // eslint-disable-next-line
        lastIndex === 3 && currentIndex === 0 ? (flag = true) : null
      } else {
        // eslint-disable-next-line
        lastIndex === 0 && currentIndex === 3 ? null : (flag = true)
      }
      if (flag) {
        key = 'nextMonth'
      }
      year = time[key].year
      month = time[key].month
      date = `${year}-${month}`
      day = ''

      if (today.indexOf(date) !== -1) {
        day = today.slice(-2)
      }

      time = this.countMonth(year, month)
      calendar[change] = null
      calendar[change] = this.generateAllDays(time[key].year, time[key].month)

      if (e.detail.source == 'touch') {
        this.setData({
          swiperIndex: e.detail.current //获取当前轮播图片的下标
        })
      }

      this.setData({
        year,
        month,
        date,
        day,
        calendar
      })
      if (this.data.workerClockData.length) {
        clearTimeout(timer)
        //滑动速度太快，小于100毫秒的话就不会向后台发请求，但是最后总会进行一次请求的。
        timer = setTimeout(() => {
          this.triggerEvent('swiperChange', {
            year,
            month
          })
          const query = wx.createSelectorQuery().in(this)
          query.selectAll('.calendar-item').boundingClientRect(rects => {
              const heights = rects.map(it => it.height)
              let swiperHeight = heights[currentIndex]
              this.setData({
                swiperHeight
              })
            })
            .exec()
        }, 100)
      }
    },
    /**
     *
     * 点击切换月份，生成本月视图以及临近两个月的视图
     * @param {any} year
     * @param {any} month
     * @returns {object} calendar
     */
    generateThreeMonths(year, month) {
      const {
        swiperIndex,
        swiperMap,
        calendar
      } = this.data
      const thisKey = swiperMap[swiperIndex]
      const lastKey = swiperMap[swiperIndex - 1 === -1 ? 3 : swiperIndex - 1]
      const nextKey = swiperMap[swiperIndex + 1 === 4 ? 0 : swiperIndex + 1]
      const time = this.countMonth(year, month)
      delete calendar[lastKey]
      calendar[lastKey] = this.generateAllDays(
        time.lastMonth.year,
        time.lastMonth.month
      )
      delete calendar[thisKey]
      calendar[thisKey] = this.generateAllDays(
        time.thisMonth.year,
        time.thisMonth.month
      )
      delete calendar[nextKey]
      calendar[nextKey] = this.generateAllDays(
        time.nextMonth.year,
        time.nextMonth.month
      )
      return calendar
    },
    bindDayTap(e) {
      let cantTap = false
      let lackCount = 0
      this.data.workerClockData.forEach(item => {
        if (e.currentTarget.dataset.date === item.clockDate && item.state === -1) {
          cantTap = true
        }
        if (e.currentTarget.dataset.date === item.clockDate) {
          lackCount = item.lackCount
        }
      })
      if (!this.data.workerClockData.length || cantTap) {
        return
      }
      const {
        month,
        year
      } = this.data
      const time = this.countMonth(year, month)
      const tapMon = e.currentTarget.dataset.month
      const day = e.currentTarget.dataset.day
      if (String(tapMon) === String(time.lastMonth.month)) {
        this.changeDate(time.lastMonth.year, time.lastMonth.month)
      } else if (String(tapMon) === String(time.nextMonth.month)) {
        this.changeDate(time.nextMonth.year, time.nextMonth.month)
      } else {
        this.setData({
          day
        })
      }
      const beSelectDate = e.currentTarget.dataset.date
      this.setData({
        beSelectDate,
        showCalendar: false
      })
      if (this.data.workerClockData.length) {
        this.triggerEvent('daytap', {
          beSelectDate,
          lackCount
        })
      }
    },
    prevMonth(e) {
      const {
        year,
        month
      } = this.data
      const time = this.countMonth(year, month)
      this.changeDate(time.lastMonth.year, time.lastMonth.month)
      let timeLastMonthYear = time.lastMonth.year
      let timeLastMonth = time.lastMonth.month
      if (this.data.workerClockData.length) {
        this.triggerEvent('swiperChange', {
          year: timeLastMonthYear,
          month: timeLastMonth
        })
      }
      setTimeout(() => {
        const query = wx.createSelectorQuery().in(this)
        query.selectAll('.calendar-item').boundingClientRect(rects => {
            const heights = rects.map(it => it.height)
            let swiperHeight = heights[this.data.swiperIndex]
            this.setData({
              swiperHeight
            })
          })
          .exec()
      }, 100)
    },
    nextMonth(e) {
      const {
        year,
        month
      } = this.data
      const time = this.countMonth(year, month)
      this.changeDate(time.nextMonth.year, time.nextMonth.month)
      let timeNextMonthYear = time.nextMonth.year
      let timeNextMonth = time.nextMonth.month
      if (this.data.workerClockData.length) {
        this.triggerEvent('swiperChange', {
          year: timeNextMonthYear,
          month: timeNextMonth
        })
      }
      setTimeout(() => {
        const query = wx.createSelectorQuery().in(this)
        query.selectAll('.calendar-item').boundingClientRect(rects => {
            const heights = rects.map(it => it.height)
            let swiperHeight = heights[this.data.swiperIndex]
            this.setData({
              swiperHeight
            })
          })
          .exec()
      }, 100)
    },
    /**
     *
     * 直接改变日期
     * @param {any} year
     * @param {any} month
     */
    changeDate(year, month) {
      let {
        day,
        today
      } = this.data
      const calendar = this.generateThreeMonths(year, month)
      const date = `${year}-${month}`
      date.indexOf(today) === -1 ? (day = '01') : (day = today.slice(-2))

      this.setData({
        calendar,
        day,
        date,
        month,
        year
      })
    },
    /**
     *
     * 月份处理
     * @param {any} year
     * @param {any} month
     * @returns
     */
    countMonth(year, month) {
      const lastMonth = {
        month: this.formatMonth(parseInt(month) - 1)
      }
      const thisMonth = {
        year,
        month,
        num: this.getNumOfDays(year, month)
      }
      const nextMonth = {
        month: this.formatMonth(parseInt(month) + 1)
      }
      // @ts-ignore
      lastMonth.year =
        parseInt(month) === 1 && parseInt(lastMonth.month) === 12 ?
        `${parseInt(year) - 1}` :
        year + ''
      // @ts-ignore
      lastMonth.num = this.getNumOfDays(lastMonth.year, lastMonth.month)
      // @ts-ignore
      nextMonth.year =
        parseInt(month) === 12 && parseInt(nextMonth.month) === 1 ?
        `${parseInt(year) + 1}` :
        year + ''
      // @ts-ignore
      nextMonth.num = this.getNumOfDays(nextMonth.year, nextMonth.month)
      return {
        lastMonth,
        thisMonth,
        nextMonth
      }
    },
    currentMonthDays(year, month) {
      const numOfDays = this.getNumOfDays(year, month)
      return this.generateDays(year, month, numOfDays)
    },
    /**
     * 生成上个月应显示的天
     * @param {any} year
     * @param {any} month
     * @returns
     */
    lastMonthDays(year, month) {
      const lastMonth = this.formatMonth(parseInt(month) - 1)
      const lastMonthYear =
        parseInt(month) === 1 && parseInt(lastMonth) === 12 ?
        `${parseInt(year) - 1}` :
        year
      const lastNum = this.getNumOfDays(lastMonthYear, lastMonth) // 上月天数
      const startWeek = this.getWeekOfDate(year, month - 1, 1) // 本月1号是周几
      const days = []
      if (Number(startWeek) === 7) {
        return days
      }

      const startDay = lastNum - startWeek

      return this.generateDays(lastMonthYear, lastMonth, lastNum, {
        startNum: startDay + 1,
        notCurrent: true,
        lastMonth: true
      })
    },
    /**
     * 生成下个月应显示天
     * @param {any} year
     * @param {any} month
     * @returns
     */
    nextMonthDays(year, month) {
      const nextMonth = this.formatMonth(parseInt(month) + 1)
      const nextMonthYear =
        parseInt(month) === 12 && parseInt(nextMonth) === 1 ?
        `${parseInt(year) + 1}` :
        year
      const nextNum = this.getNumOfDays(nextMonthYear, nextMonth) // 下月天数
      const endWeek = this.getWeekOfDate(year, month) // 本月最后一天是周几
      const days = []
      let daysNum = 0
      if (Number(endWeek) === 6) {
        return days
      } else if (Number(endWeek) === 7) {
        daysNum = 6
      } else {
        daysNum = 6 - endWeek
      }
      return this.generateDays(nextMonthYear, nextMonth, daysNum, {
        startNum: 1,
        notCurrent: true,
        isNextMonth: true
      })
    },
    /**
     *
     * 生成一个月的日历
     * @param {any} year
     * @param {any} month
     * @returns Array
     */
    generateAllDays(year, month) {
      const lastMonth = this.lastMonthDays(year, month)
      const thisMonth = this.currentMonthDays(year, month)
      // const nextMonth = this.nextMonthDays(year, month)
      const days = [].concat(lastMonth, thisMonth)

      return days
    },
    /**
     *
     * 生成日详情
     * @param {any} year
     * @param {any} month
     * @param {any} daysNum
     * @param {boolean} [option={
     *  startNum:1,
     *  grey: false
     * }]
     * @returns Array 日期对象数组
     */
    generateDays(
      year,
      month,
      daysNum,
      option = {
        startNum: 1,
        notCurrent: false
      }
    ) {
      const weekMap = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      let days = []
      for (let i = option.startNum; i <= daysNum; i++) {
        const week = weekMap[new Date(year, month - 1, i).getUTCDay()]
        const day = this.formatDay(i)
        const showDay = i
        days.push({
          date: `${year}-${month}-${day}`,
          event: false,
          day,
          showDay,
          week,
          month,
          year
        })
      }
      return days
    },
    /**
     *
     * 获取指定月第n天是周几 |
     * 9月第1天： 2017, 08, 1 |
     * 9月第31天：2017, 09, 0
     * @param {any} year
     * @param {any} month
     * @param {number} [day=0] 0为最后一天，1为第一天
     * @returns number 周 1-7,
     */
    getWeekOfDate(year, month, day = 0) {
      let dateOfMonth = new Date(year, month, 0).getUTCDay() + 1
      // eslint-disable-next-line
      Number(dateOfMonth) === 7 ? (dateOfMonth = 0) : ''
      return dateOfMonth
    },
    /**
     *
     * 获取本月天数
     * @param {number} year
     * @param {number} month
     * @param {number} [day=0] 0为本月0最后一天的
     * @returns number 1-31
     */
    getNumOfDays(year, month, day = 0) {
      return new Date(year, month, day).getDate()
    },
    /**
     *
     * 月份处理
     * @param {number} month
     * @returns format month MM 1-12
     */
    formatMonth(month) {
      let monthStr = ''
      if (month > 12 || month < 1) {
        monthStr = Math.abs(month - 12) + ''
      } else {
        monthStr = month + ''
      }
      monthStr = `${monthStr.length > 1 ? '' : '0'}${monthStr}`
      return monthStr
    },
    formatDay(day) {
      return `${(day + '').length > 1 ? '' : '0'}${day}`
    },
    showTip() {
      this.triggerEvent('showTips')
    }
  }
})
