// pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    isAuth:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let that = this;
      // 获取用户是否授权
    wx.getSetting({
      success: function(res){
        console.log(res.authSetting["scope.userInfo"])
        //res.authSetting["scope.userInfo"] 为 true  已授权
        if(res.authSetting["scope.userInfo"]){
          // 获取用户信息
          wx.getUserInfo({
            success: function(e){
              that.setData({
                userInfo: e.userInfo,
                isAuth: true
              })
            }
          })
        }
      }
    })
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
  //点击获取用户信息
  onGetUserInfo: function(e){
    console.log("e-->",e)
    if(e.detail.userInfo){
      this.setData({
        userInfo:e.detail.userInfo,
        isAuth:true
      })
    }
  }
})