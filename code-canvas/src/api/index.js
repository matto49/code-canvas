import axios from 'axios'
if(process.env.NODE_ENV === "development") axios.defaults.baseURL = '/api'

export async function addCanvas(data) {
  return (await axios({
    method:'post',
    url:'/frame/add',
    data:JSON.stringify(data)
  }))
}
export async function getList() {
  return (await axios({
    url:'/frame/list'
  }))
}
export async function getCanvas(data) {
  return (await axios({
    url:'/frame',
    params:data
  }))
}
export async function login(data) {
  return (await axios({
    method:'post',
    url:'/login',
    data:JSON.stringify(data)
  }))
}
