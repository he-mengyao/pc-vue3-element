import http from "./"
import qs from 'qs'

export default {
  // 登录
  login({ username, password }: { username: string, password: string }) {
    return http.post('login', {
      username,
      password
    })
  },
  // 用户列表
  Getusers({ query, pagenum, pagesize }: { query: string, pagenum: number, pagesize: number }) {
    return http.get(`users?query=${query}&pagenum=${pagenum}&pagesize=${pagesize}`)
  },
  // 添加用户
  Addusers({ username, password, email, mobile }: { username: string, password: string, email: string, mobile: string }) {
    return http.post('users', {
      username,
      password,
      email,
      mobile
    })
  },
  // 修改用户状态
  Changeuser({ uId, type }: { uId: string, type: boolean }) {
    return http.put(`users/${uId}/state/${type}`)
  },
  // 编辑用户提交
  Subituser({ id, email, mobile }: { id: string, email: string, mobile: string }) {
    return http.put(`users/${id}`, {
      email,
      mobile
    })
  },
  // 删除单个用户
  delete({ id }: { id: string }) {
    return http.delete(`users/${id}`)
  },
  // 分配用户角色
  distributerole({ id, rid }: { id: number, rid: number }) {
    return http.put(`users/${id}/role`, { rid })
  },
  // 左侧菜单栏
  Getmenus() {
    return http.get('menus')
  },
  // 根据 ID 查询用户信息
  search({ id }: { id: string }) {
    return http.get(`users/${id}`)
  },
  // 所有权限列表
  getRights({ type }: { type: string }) {
    return http.get(`rights/${type}`)
  },
  // 商品列表
  getGoods({ query, pagenum, pagesize }: { query: string, pagenum: number, pagesize: number }) {
    return http.get(`goods/?query=${query}&pagenum=${pagenum}&pagesize=${pagesize}`)
  },
  // 获取商品分类
  getCategories({ type, pagenum, pagesize }: { type: number, pagenum: number, pagesize: number }) {
    if (type === 0) {
      if (pagenum !== 0 && pagesize !== 0) {
        return http.get(`categories?pagenum=${pagenum}&pagesize=${pagesize}`)
      } else {
        return http.get(`categories`)
      }
    } else {
      return http.get(`categories?type=${type}&pagenum=${pagenum}&pagesize=${pagesize}`)
    }
    // return http.get(`categories`)
  },
  // 添加分类
  addCategories({ cat_pid, cat_name, cat_level }: { cat_pid: number, cat_name: string, cat_level: number }) {
    return http.post(`categories`, { cat_pid, cat_name, cat_level })
  },
  // 编辑提交分类
  editCategories({ id, cat_name }: { id: number, cat_name: string }) {
    return http.put(`categories/${id}`, { cat_name })
  },
  // 基于时间统计的折线图
  getReports() {
    return http.get(`reports/type/1`)
  },
  // 订单数据列表
  getOrders({ query, pagenum, pagesize }: { query: string, pagenum: number, pagesize: number }) {
    return http.get(`orders?query=${query}&pagenum=${pagenum}&pagesize=${pagesize}`)
  },
  // 删除商品
  delGoods({ id }: { id: number }) {
    return http.delete(`goods/${id}`)
  },
  // 删除分类
  delCategory({ id }: { id: number }) {
    return http.delete(`categories/${id}`)
  },
  // 获取角色列表
  getRoles() {
    return http.get(`roles`)
  },
  // 添加角色
  addRoles({ roleName, roleDesc }: { roleName: string, roleDesc: string }) {
    if (roleDesc === '') {
      return http.post(`roles`, { roleName })
    } else {
      return http.post(`roles`, { roleName, roleDesc })
    }
  },
  // 编辑 提交角色
  putRoles({ id, roleName, roleDesc }: { id: number, roleName: string, roleDesc: string }) {
    if (roleDesc === '') {
      return http.put(`roles/${id}`, { roleName })
    } else {
      return http.put(`roles/${id}`, { roleName, roleDesc })
    }
  },
  // 删除角色
  delRoles({ id }: { id: number }) {
    return http.delete(`roles/${id}`)
  },
  // 删除角色指定权限
  delRoleRights({ roleId, rightId }: { roleId: number, rightId: number }) {
    return http.delete(`roles/${roleId}/rights/${rightId}`)
  },
  // 所有权限列表
  getRight({ type }: { type: string }) {
    return http.get(`rights/${type}`)
  },
  // 角色授权
  postRights({ roleId, rids }: { roleId: number, rids: any }) {
    return http.post(`roles/${roleId}/rights`, qs.stringify({ rids }))
  },
  // 参数列表
  getAttributes({ id, sel }: { id: number, sel: string }) {
    return http.get(`categories/${id}/attributes?sel=${sel}`)
  },
  // 添加参数
  addAttributes({ id, attr_name, attr_sel, attr_vals }: { id: number, attr_name: string, attr_sel: string, attr_vals: any }) {
    if (attr_sel === 'many') {
      return http.post(`categories/${id}/attributes`, { attr_name, attr_sel, attr_vals })
    } else {
      return http.post(`categories/${id}/attributes`, { attr_name, attr_sel })
    }
  },
  // 删除参数
  deleteAttr({ id, attrid }: { id: number, attrid: number }) {
    return http.delete(`categories/${id}/attributes/${attrid}`)
  },
  //编辑提交参数
  editcategories({ id, attrId, attr_name, attr_sel, attr_vals }: { id: number, attrId: number, attr_name: string, attr_sel: string, attr_vals: string }) {
    return http.put(`categories/${id}/attributes/${attrId}`, { attr_name, attr_sel, attr_vals })
  },
  // 图片上传
  upload({ file }: { file: any }) {
    return http.post(`upload`, { file })
  },
  // 添加商品的请求
  addGoods({ goods_name, goods_cat, goods_price, goods_number, goods_weight, goods_introduce, pics, attrs }:
    { goods_name: string, goods_cat: string, goods_price: number, goods_number: number, goods_weight: number, goods_introduce: string, pics: any, attrs: any }) {
    return http.post('goods', { goods_name, goods_cat, goods_price, goods_number, goods_weight, goods_introduce, pics, attrs })
  }
}