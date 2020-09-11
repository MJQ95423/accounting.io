// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
const db = cloud.database()

// 操作条件命令，db.command是个对象
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("event-->",event)
  let obj = {}
  // 如果页面传值传了一个字段timeType的话，并且值等于1的时候，则是根据一段范围获取数据
  if(event.timeType == 1){
    obj.userInfo = event.userInfo
    //gte：是大于等于  and:并且  lte:小于等于
    obj.date = _.gte(event.start).and(_.lte(event.end))
  }else{
    obj = event
  }
  console.log("obj-->",obj)
  try{
    return await db.collection("msg_data").where(obj).get()
  }catch(e){
    console.log(e)
  }

}