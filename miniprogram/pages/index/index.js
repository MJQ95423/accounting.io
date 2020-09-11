// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    //日期范围数据
    dateRange: {
      start: "",
      end: ""
    },
    msgData:[], // 获取的记账记录信息
    isFristShow: true, // 判断是否页面首次加载
    currentDate: "", //选中的日期
    isToday:true, //判断选中是否为当天日期
    cost: {
      shouru: 0,
      zhichu: 0
    },
    monthDate: "" ,//
    monthCost:{
      shouru: 0,
      zhichu: 0
    },
    surplus:{
      num:0,
      decimal: "00"
      
    }
},       

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { // 页面只会加载一次
    console.log("首次加载")
    // 获取时间范围函数
    this.setDate();
    // 获取记账记录信息函数
    this.getMsgData(this.data.dateRange.end);

    //获取对应月份记账信息
    this.data.monthDate = this.data.dateRange.end.substring(0,7);
    this.getMonMsgData(this.data.monthDate)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onshow执行")
    // 加入页面是首次加载，就不执行getMsgData函数
    if (this.data.isFristShow){
      this.data.isFristShow = false
    }else{
      console.log(111)
      // 获取记账记录信息函数
      this.getMsgData(this.data.dateRange.end);
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 更改日期事件
  selectDate: function(e){
    console.log(e)
    // 重新获取数据
    this.getMsgData(e.detail.value);

    if(e.detail.value.substring(0,7) != this.data.monthDate){
      this.data.monthDate = e.detail.value.substring(0,7);
      this.getMonMsgData(this.data.monthDate)
    }
    

  },

  // 获取时间范围函数
 setDate: function(){
  // 设置开始日期和结束日期

   // 实例化
   var timer = new Date();

   // 获取年
   var year = timer.getFullYear();

   // 获取月份, 月份从0开始，真实月份需加一
   var month = timer.getMonth() + 1;

   // 获取日
   var date = timer.getDate();
   // console.log(date)

   // 开始日期
   var start = year - 1 + "-" + this.addZero(month) + "-" + this.addZero(date);

   // console.log(start)

   // 结束日期
   var end = year + "-" + this.addZero(month) + "-" + this.addZero(date);
   // console.log(end)

  // 设置data里的值
  this.setData({
    dateRange: {
      start,
      end
    }
  })
},
// 补零函数
 addZero: function(num){

   return num < 10 ? "0" + num : num;

},
  //获取某天记账记录信息
  getMsgData: function(time){
    console.log(time)
    let that=this;

    //收入支出累加清零
    that.data.cost.zhichu = 0;
    that.data.cost.shouru = 0;

    wx.showLoading({
      title: '加载中'
    })

    wx.cloud.callFunction({
      name: "get_msg_data",
      data: {
        date: time
      },
      success: function(res){
        // 关闭加载框
        wx.hideLoading();

        console.log("成功-->",res)
        let data = res.result.data;

        data.forEach(v =>{
          //第一种
          if(v.cost == "支出"){
            that.data.cost.zhichu += Number(v.money)
          }else{
            that.data.cost.shouru += Number(v.money)
          }

          //第二种简写
          // that.data.cost[v.costType] += Number(v.money);

          //toFixed: 保留小数位，调用者只能是数字
          // Number() 强制转换为数字类型
          v.money = Number(v.money).toFixed(2)
        })

        //收入与支出转千分位toLocaleString()，只能是数字类型调用 1,000
        that.data.cost.zhichu = that.data.cost.zhichu.toLocaleString();
        that.data.cost.shouru = that.data.cost.shouru.toLocaleString();

        //判断选择的日期是否为当天
        if(time == that.data.dateRange.end){
          that.data.isToday=true;
        }else{
          that.data.isToday=false;
        }
        
        // 修改currentDate
        let timeArr = time.split("-");
        // console.log(timeArr)
        // 获取今年月份
        let year = new Date().getFullYear();

        if(year == timeArr[0]){
          that.data.currentDate = timeArr[1] + "月" + timeArr[2] + "日";
        }else{
          that.data.currentDate = timeArr[0] + "年" +timeArr[1] + "月" + timeArr[2] + "日";
        }

        that.setData({
          msgData:data,
          currentDate: that.data.currentDate,
          cost:that.data.cost,
          isToday:that.data.isToday
        })
      },
      fail: function(err){
        // 关闭加载框
        wx.hideLoading();
        console.log("失败-->",err)
      }
    })
  },
  //获取对应月的记账信息
  getMonMsgData: function(month){
    // console.log(month)
    let that = this;
    that.data.monthCost.zhichu = 0;
    that.data.monthCost.shouru = 0;
    //调用get_msg_data云函数，获取对应月的记账信息
    wx.cloud.callFunction({
      name:"get_msg_data",
      data:{
        month
      },
      success:function(res){
        console.log("成功!!",res)

        let data = res.result.data;
        data.forEach(v=>{
          if(v.cost == "支出"){
            that.data.monthCost.zhichu += Number(v.money)
          }else{
            that.data.monthCost.shouru += Number(v.money)
          }
        })

        let surplus = (that.data.monthCost.shouru - that.data.monthCost.zhichu).toFixed(2).split(".");
        // console.log("surplus-->",surplus)

        that.data.monthCost.zhichu = that.data.monthCost.zhichu.toFixed(2);
        that.data.monthCost.shouru = that.data.monthCost.shouru.toFixed(2);

        that.setData({
          monthCost:that.data.monthCost,
          surplus:{
            num:surplus[0],
            decimal:surplus[1]
          }
        })
      },
      fail:function(err){
        console.log("失败!!",err)
      }
    })

  }

})