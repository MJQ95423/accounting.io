// pages/chart/chart.js
// 引入图表charts插件
var wxCharts = require('../../js/wxcharts-min.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isYear:false,
    isDate:false,
    allMsgData:[],
    currentYear: "",
    yearList:[],
    monthList:[],
    dateList:[],
    tabData:[
      {
        title:"年收入",
        money:0,
        type:"shouru",
        isAct:true
      },
      {
        title:"年支出",
        money:0,
        type:"zhichu",
        isAct:false
      }
    ],
    tyData:{},
    isCanShow:true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllMsgData();


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
  showItem:function(e){
    //接收参数
    let type = e.currentTarget.dataset.type

    if(type == "isYear"){
      this.setData({
        isYear:!this.data[type],
        isDate:false
      })
    }else if(type == "isDate"){
      // 月份是否激活
      let active = false;
      // 判断有没有选择月份
      for(var i = 0; i < this.data.monthList.length; i++){
        // 存在isAct为true，则是月份已激活
        if(this.data.monthList[i].isAct){
          active = true;
        }
      }
      // active = false,说明月份没有激活的,isDate不需要设置，终止代码
      if(!active){
        wx.showToast({
          title:"请选择月份",
          icon:"none",
          duration:2000,
          mask:true
        })
        return;
      }
      this.setData({
        isDate:!this.data[type],
        isYear:false
      })
    }
  },
  //获取索引数据，处理时间导航
  getAllMsgData: function(){
    var that=this;
    // 调用云函数get_msg_data, 获取所有数据
    wx.cloud.callFunction({
      name: "get_msg_data",
      success: function(res){
        console.log("成功-->",res)
        //遍历数据
        res.result.data.forEach(v =>{
          //获取年份
          // 需满足条件--》截取的年份在yearList不存在
          let y=v.date.substring(0,4)
          // indexOf(要查询的元素/字符)，数组和字符串都可调用的方法，若数组存在当前查询的元素，则返回元素首次出现的下标，若不存在则返回 -1
          if(that.data.yearList.indexOf(y) == -1){ // yearList不存在该年份的时候添加该年份
            that.data.yearList.push(y)
          }
        })
        // 数组排序 sort(fn) 参数接收一个函数,会直接影响原函数
        that.data.yearList.sort(function(a,b) {return a-b}) //升序
        // that.data.yearList.sort(function(a,b) {return b-a}) //降序
        // console.log(that.data.yearList)

        that.setData({
            allMsgData:res.result.data,
            yearList: that.data.yearList,
            currentYear:that.data.yearList[that.data.yearList.length-1]
        })
        // 获取对应月份
        that.selectDate(that.data.currentYear,5,7,"monthList");
        // 通过当前选中的年份获取数据
        that.selectYearData(that.data.currentYear);
      },
      fail:function(err){
        console.log("失败-->",err)
      }
    })
  },
  //获取当前年的对应月份
  selectDate:function(time,start,end,dataName){
    // time: 如果是获取月份则传年份进来，如 2020 ，如果是获取日则传年yue进来，如 2020-04
    // start: 开始截取下标，如果是获取月份，从下标为5开始截取  如果是获取日份，从下标为8开始截取
    // end: 结束截取下标，如果是获取月份，从下标为57结束截取  如果是获取日份，从下标为10结束截取
    // dataName: 要修改的数据名称 如果是获取月份是修改monthList  如果是获取日份则修改dateList
    this.data[dataName] = []
    let allMsgData = this.data.allMsgData;
    let dataArr = [];
    allMsgData.forEach(v =>{
      // 需满足两个条件
      // 1. 要是当前的年份的月份
      // 2.在dataArr这个数组里不存在
      // 截取数据的月份
      let mon = Number(v.date.substring(start,end));
      if(v.date.indexOf(time) != -1 && dataArr.indexOf(mon) ==-1){
        dataArr.push(mon)
      }
    })
    //对数据排列
    dataArr.sort(function(a,b) {return a-b})
    for(var i=0; i<dataArr.length; i++){
      this.data[dataName].push({num: dataArr[i] , isAct:false})
    }
    this.setData({
      [dataName]:this.data[dataName]
    })
  },
  //年列表的点击事件
  yearTab:function(e){
    if(e.currentTarget.dataset.year == this.data.currentYear){
      return;
    }
    this.data.tabData[0].isAct = true;
    this.data.tabData[1].isAct = false;
    

    this.setData({
      currentYear: e.currentTarget.dataset.year,
      tabData: this.data.tabData
    })
    // 切换年份，获取对应月份
    this.selectDate(this.data.currentYear,5,7,"monthList")
    // 获取对应的年份的数据
    this.selectYearData(this.data.currentYear)
  },
  // 月列表的点击事件
  monthTap: function(e){
    // 获取当前点击月份的下标
    let index = e.currentTarget.dataset.index;
    // 判断当前点击的月份是否是激活状态，是则终止代码
    if(this.data.monthList[index].isAct){
      return;
    }
    for(var i = 0; i < this.data.monthList.length; i++){
      if(this.data.monthList[i].isAct){
        this.data.monthList[i].isAct = false;
        break;
      }
    }

    this.data.monthList[index].isAct=true;
    this.setData({
      monthList:this.data.monthList
    })
    let time = this.data.currentYear + '-' + this.addZero(this.data.monthList[index].num)
    // 点击月份获取对应的日列表
    this.selectDate(time,8,10,"dateList")
  },
  // 日列表的点击事件
  dateTap:function(e){
    // 获取当前点击月份的下标
    let index = e.currentTarget.dataset.index;
    // 判断当前点击的月份是否是激活状态，是则终止代码
    if(this.data.dateList[index].isAct){
      return;
    }
    for(var i = 0; i < this.data.dateList.length; i++){
      if(this.data.dateList[i].isAct){
        this.data.dateList[i].isAct=false;
        break;
      }
    }

    this.data.dateList[index].isAct=true;
    this.setData({
      dateList:this.data.dateList
    })
  },
  // 标题切换的点击事件
  toggleTap:function(e){
    var that = this;
    // 获取当前点击月份的下标
    let index = e.currentTarget.dataset.index;
    // console.log("index-->",index)
    // console.log("this-->",this.data.monthList)
    // 判断当前点击的标题是否是激活状态，是则终止代码
    if(that.data.tabData[index].isAct){
      return;
    }
    for(var i = 0; i < that.data.tabData.length; i++){
      if(that.data.tabData[i].isAct){
        that.data.tabData[i].isAct = false;
        break;
      }
    }
    // console.log("this-->",that.data.tabData[index])
    that.data.tabData[index].isAct = true;
    let type = this.data.tabData[index].type
    this.formatPieData(this.data.tyData[type])
    this.setData({
      tabData:that.data.tabData
    })
  },
  // 通过年份获取数据
  selectYearData:function(year){

    // 参数： year：年份
    console.log("year-->",year)
    // 开始范围
    let start = year + "-01-01";
    // 结束范围
    let end = year + "-12-31";

    // console.log(start,end)
    let that = this;
    wx.cloud.callFunction({
      name: "get_msg_data",
      data: {
        timeType: 1,
        start: start,
        end: end
      },
      success:function(res){
        console.log("成功-->",res)

        //根据收入支出分类数据
        let type = ["shouru" , "zhichu"]
        let tyData = {}; //存放根据收入支出分好类的数据

        type.forEach((v , i)=>{
          //v:当前项  i: 下标
          that.data.tabData[i].money = 0; //累加清零
          tyData[v] = []
          res.result.data.forEach(item => {
            if(item.costType == v){
              tyData[v].push(item)
              that.data.tabData[i].money += Number(item.money);
            }
          })
        })
        // console.log("tyData-->",tyData)

        // 默认先计算收入的各类百分比
        that.formatPieData(tyData.shouru)

        that.setData({
          tabData: that.data.tabData,
          tyData:tyData
        })
      },
      fail:function(err){
        console.log("失败-->",err)
      }
    })
  },
  // 计算各类的百分比
  formatPieData: function(data){
    console.log("data-->",data)
    // 记录所有类型
    let types = []
    // 总金额
    let total = 0;
    // 存放图标数据
    let series = []

    data.forEach(v =>{
      total += Number(v.money) // 计算总价
      if(types.indexOf(v.title) == -1){ // 按title将收入的数据分类
        types.push(v.title)
      }
    })
    // console.log(total)
    // console.log(types)
    if(total = 0){
      this.setData({
        isCanShow: false
      })
      return;
    }else{
      this.setData({
        isCanShow: true
      })
    }

    types.forEach((v , i )=>{
      let seriesData = {
        name: v,
        data: 0,
        format(value){
          return v + Number(value*100).toFixed(2) + "%"
        }
      }

      data.forEach(item =>{
        if(v == item.title){
          seriesData.data += Number(item.money) // 获取各类的总价格
        }
      })
      // 各类的总价/ 所有类的总价
      // seriesData.data = Number(seriesData.data / total).toFixed(2)
      // console.log(seriesData)
      series.push(seriesData)
    })

    // console.log(series)
    this.drawPie(series)

  },
  // 绘制函数
  drawPie:function(series){
    new wxCharts({
      // 页面上canvas组件的id，因需要获取id，所以需要在页面渲染完成后才执行
      canvasId: 'pieCanvas',  
      type: 'pie', //图表类型 pie:饼图
      series,
      width: 360,  
      height: 300,
      dataLabel: true
    });
  },
  // 补零函数
  addZero: function(num){
    return num < 10 ? "0" + num : num;
},
})