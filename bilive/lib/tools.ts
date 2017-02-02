import * as fs from 'fs'
import * as request from 'request'
import * as bluebird from 'bluebird'
import { config, usersData, userData } from '../index'
/**
 * 添加request头信息
 * 
 * @export
 * @template T
 * @param {request.Options} options
 * @returns {bluebird<T>}
 */
export function XHR<T>(options: request.Options): bluebird<T> {
  // 开启gzip压缩
  options.gzip = true
  // 添加头信息
  let headers = { 'user-agent': 'Mozilla/5.0 BiliDroid/4.34.0 (bbcallen@gmail.com)' }
  if (options.method === 'POST') headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (options.headers == null) options.headers = headers
  else Object.assign(options.headers, headers)
  // 返回异步request
  return new bluebird<T>((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error == null) resolve(body)
      else reject(error)
    })
  })
}
/**
 * 设置cookie
 * 
 * @export
 * @param {string} cookieString
 * @param {string} url
 * @returns {request.CookieJar}
 */
export function SetCookie(cookieString: string, url: string): request.CookieJar {
  let jar = request.jar()
  cookieString.split(';').forEach((cookie) => {
    jar.setCookie(request.cookie(cookie), url)
  })
  return jar
}
/**
 * 操作数据文件, 为了可以快速应用不使用数据库
 * 
 * @export
 * @param {string} [uid]
 * @param {userData} [userData]
 * @returns {bluebird<config>}
 */
export function UserInfo(uid?: string, userData?: userData): bluebird<config> {
  return new bluebird<config>((resolve, reject) => {
    fs.readFile(`${__dirname}/../options.json`, (error, data) => {
      if (error == null) {
        let appConfig = <config>JSON.parse(data.toString())
        if (userData == null) {
          let usersData = appConfig.usersData
          let canUsersData: usersData = {}
          for (let uid in usersData) {
            if (usersData[uid].status) Object.assign(canUsersData, { [uid]: usersData[uid] })
          }
          appConfig.usersData = canUsersData
          resolve(appConfig)
        }
        else if (uid != null && userData != null) {
          delete userData.jar
          Object.assign(appConfig.usersData, { [uid]: userData })
          let jsonStr = JSON.stringify(appConfig)
          fs.writeFile(`${__dirname}/../options.json`, jsonStr, (error) => {
            if (error == null) resolve()
            else reject(error)
          })
        }
      }
      else reject(error)
    })
  })
}
/**
 * 格式化输出, 配合PM2凑合用
 * 
 * @export
 * @param {*} [message]
 * @param {...any[]} optionalParams
 */
export function Log(message?: any, ...optionalParams: any[]) {
  console.log(`${new Date().toString().slice(4, 24)} :`, message, ...optionalParams)
}
/**
 * sleep
 * 
 * @export
 * @param {number} ms
 * @returns {bluebird<{}>}
 */
export function Sleep(ms: number): bluebird<{}> {
  return new bluebird((resolve, reject) => {
    setTimeout(resolve, ms, 'sleep')
  })
}