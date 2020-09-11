// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取默认环境的数据库的引用
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection("images").get()
  
}