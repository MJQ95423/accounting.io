// miniprogram/pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeData:[
      {
        title:"支出",
        isActive:true
      },
      {
        title:"收入",
        isActive:false
      }
    ],
    accountData:[
      {
        title:"现金",
        isActive:true
      },
      {
        title:"微信钱包",
        isActive:false
      },
      {
        title:"支付宝",
        isActive:false
      },
      {
        title:"储蓄卡",
        isActive:false
      },
      {
        title:"信用卡",
        isActive:false
      }
    ],
    bookkeepingData:[],
    //日期范围数据
    dateRange: {
      start: "",
      end: ""
    },
    // 用户输入的时间和金额备注信息
    info: {
      date: "",
      money: "",
      comment: ""
    },
    isAuth: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setDate();
    this.getTypeData();
  },
  onShow: function(){
    let that = this;
    // 获取用户是否授权
    wx.getSetting({
      success: function (res) {
        console.log(res.authSetting["scope.userInfo"])
        //res.authSetting["scope.userInfo"] 为 true  已授权
        if (res.authSetting["scope.userInfo"]) {
          that.setData({
            isAuth: true
          })
        }

      }
    })

  },

   /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.resetData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  //切换标签函数
  toggleTab: function(e){
    // e --> 事件对象
    // console.log(e)

    if(e.currentTarget.dataset.active){
      console.log("当前已激活")
      return;
    }

    let name = e.currentTarget.dataset.name;
    console.log(name)
    // 获取数据
    let data = this.data[name];
 
    // 将数据中原先的isActive=true 设置为false
    for(let i = 0 ; i < data.length; i++){
      if(data[i].isActive){
        data[i].isActive = false;
        break;
      }
    }

    // 获取当前点击的数据下标
    let index = e.currentTarget.dataset.index;

    data[index].isActive = true;

    //设置data里的值
    this.setData({
      [name]: data
    })
  },

  // 获取记账时间
  getInfo: function(e){
    console.log(e)
    // 获取当前修改的info字段名
    let title = e.currentTarget.dataset.type;
    this.data.info[title] = e.detail.value;
    this.setData({
      info: this.data.info
    })
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
     },
     "info.date": end
   })
 },
// 补零函数
  addZero: function(num){

    return num < 10 ? "0" + num : num;

},

 // 获取记账类型函数
 getTypeData:function(){
   var that = this;
   //打开加载框
   wx:wx.showLoading({
     title: '加载中',
     complete: (res) => {},
     fail: (res) => {},
     mask: true,
     success: (res) => {},
   })
  //  调用云函数get_type_data, 获取记账类型数据
  wx.cloud.callFunction({
    name: "get_type_data",
    success:function(res){
      console.log("成功==>",res)
      //关闭加载框
      wx.hideLoading({
        complete: (res) => {},
        fail: (res) => {},
        success: (res) => {},
      })
      //获取返回来的数据
      let data = res.result.data
      // 添加字段 ，用来提示是否被选中的作用
      data.forEach(v =>{
        v.isAct = false;
      })
      // console.log(data)

      let type = [];// 存放处理好的数据
      let begin = 0;// 开始截取下标

      //while语句，先判断条件是否成立，假如成立则执行{}里的代码块，执行完会再次判断条件，成立就执行，不成立就结束while循环
      while(begin < data.length){
        //slice(开始截取的下标，结束截取的下标) 截取的部分不包括结束截取的下标对应的内容，返回一个新的数组，不会影响数组
        let tmp = data.slice(begin,begin+8);
        begin +=8;
        type.push(tmp);
      }
      // console.log(type)

      // 设置bookkeepingData
      that.setData({
          bookkeepingData:type
      })
    },
    fail:function(err){
      console.log("失败==>",err)
    }
  })
 },

 // 记账类型的点击切换
 selectType: function(e){
    console.log(e)
    //获取bookkeepingData数据
    let bannerType = this.data.bookkeepingData;
    //第一层索引
    let index = e.currentTarget.dataset.index;
    //第二层索引
    let id = e.currentTarget.dataset.id;
    //判断当前点击的盒子是否为激活状态，如果是则取消选择
    if(bannerType[index][id].isAct){
      bannerType[index][id].isAct= false;//取消激活状态
    }else{
      //激活前把上一个isAct改为 false
      for(var i = 0;i < bannerType.length; i++){
        for(var j = 0;j<bannerType[i].length;j++){
          if(bannerType[i][j].isAct){
            bannerType[i][j].isAct=false;
            break;//找到激活的isActive就直接终止循环
          }
        }
      }
      //设置当前点击类型盒子的isActive状态为激活状态
      bannerType[index][id].isAct=true;
    }
    // 如果要页面响应，则一定要用setData
    this.setData({
      bookkeepingData:bannerType
    })
 },

 // 添加记账信息到数据库
 addMsgData: function(){

  let data = {};  // 存储记账信息的数据

  // 获取消费类型是收入还是支出
  for(var i = 0; i < this.data.typeData.length; i++){
    if (this.data.typeData[i].isActive){
      data.cost = this.data.typeData[i].title;
      data.costType = this.data.typeData[i].type;
      break;  // 找到已选择的数据就终止循环
    }
  }

  // 获取激活的记账类型
  let isSelected = false;  // 判断记账类型是否有哦被选中，默认是否
  for(var i = 0; i < this.data.bookkeepingData.length; i++){
    for (var j = 0; j < this.data.bookkeepingData[i].length; j++){

      if (this.data.bookkeepingData[i][j].isAct){

        data.iconId = this.data.bookkeepingData[i][j]._id;
        data.icon = this.data.bookkeepingData[i][j].icon_url;
        data.title = this.data.bookkeepingData[i][j].title;
        data.iconType = this.data.bookkeepingData[i][j].type;
        isSelected = true;
        break;
      }
    }
  }

  // 如果记账类型没有被选中，则需需提醒用
    if (!isSelected){
      wx.showToast({
        title: '请选择记账类型',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return; // 终止代码，以下函数不执行，数据不能提交
      
    }

    // 获取账户选择
    for(var i = 0; i < this.data.accountData.length; i++){
      if(this.data.accountData[i].isActive){
        data.account = this.data.accountData[i].title;
        data.accountType = this.data.accountData[i].type;
      }
    }

    if(this.data.info.money == ""){
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 2000,
        mask: true
      })

      return; // 终止代码，以下函数不执行，数据不能提交
    }

    // 获取用户填写的时间和金额备注信息 info是对象不能用for循环，要用for in 或forEach
    for(var key in this.data.info){  // key: 对象的键名， in后是需要遍历的对象或数组
      data[key] = this.data.info[key]
    }

    // 添加信息的月份
    data.month = this.data.info.date.substring(0,7);

  console.log(data)
  wx.showLoading({
    title: '正在保存'
  })

  // 记录this
  let that = this;

  // 调用云函数add_msg_data
  wx.cloud.callFunction({
    name: "add_msg_data",
    data,
    success: function(res){
      // 关闭加载框
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      console.log("调用云函数add_msg_data成功-->",res)
      // 重置页面，恢复原样
      that.resetData()
    },
    fail: function(err){
      wx.hideLoading()
      console.log("调用云函数add_msg_data失败-->", err)
    }
  })

  },

 //重置数据
 resetData: function(){
   this.data.typeData[0].isActive=true;
   this.data.typeData[1].isActive=false;

   // 重置记账类型
   for (var i = 0; i < this.data.bookkeepingData.length; i++) {
    for (var j = 0; j < this.data.bookkeepingData[i].length; j++) {
      if (this.data.bookkeepingData[i][j].isAct) { //找到激活的类型，就取消激活
        this.data.bookkeepingData[i][j].isAct = false;
        break;
      }
    }
  }

   //重置账户选择
   this.data.accountData[0].isActive=true;
   for(var i=1; i<this.data.accountData.length; i++){
     this.data.accountData[i].isActive=false;
   }

   this.setData({
     typeData: this.data.typeData,
     bookkeepingData: this.data.bookkeepingData,
     accountData: this.data.accountData,
     info: {
       date: this.data.dateRange.end, // 设回当天日期
       money:"",
       comment:""
     }
   })
 },
 // 点击获取授权框
 onGetUserInfo: function(e){
  if (e.detail.userInfo) {   // 授权成功返回用户数据
    this.setData({
      isAuth: true
    })
  }
}

})