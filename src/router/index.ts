import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import layout from "../views/layout/layout.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: layout,
    children: [{
      path: "/",
      name: "Home",
      component: Home,
      meta: {
        title: "首页",
        index: '/'
      }
    },
    {
      path: "users",
      name: "users",
      component: () =>
        import("../views/users/users.vue"),
      meta: {
        title: "用户列表",
        index: 'users'
      }
    },
    {
      path: "rights",
      name: "rights",
      component: () =>
        import("../views/rights/rights.vue"),
      meta: {
        title: "权限列表",
        index: 'rights'
      }
    },
    {
      path: "goods",
      name: "goods",
      component: () =>
        import("../views/goods/goods.vue"),
      meta: {
        title: "商品管理",
        index: 'goods'
      }
    },
    {
      path: "params",
      name: "params",
      component: () =>
        import("../views/goods/params.vue"),
      meta: {
        title: "分类参数",
        index: 'params'
      }
    },
    {
      path: "orders",
      name: "orders",
      component: () =>
        import("../views/orders/orders.vue"),
      meta: {
        title: "订单列表",
        index: 'orders'
      }
    },
    {
      path: "reports",
      name: "reports",
      component: () =>
        import("../views/reports/reports.vue"),
      meta: {
        title: "数据统计",
        index: 'reports'
      }
    },
    {
      path: "roles",
      name: "roles",
      component: () =>
        import("../views/rights/roles.vue"),
      meta: {
        title: "角色列表",
        index: 'roles'
      }
    },
    {
      path: "categories",
      name: "categories",
      component: () =>
        import("../views/goods/categories.vue"),
      meta: {
        title: "商品分类",
        index: 'categories'
      }
    },
    {
      path: "addGoods",
      name: "addGoods",
      component: () =>
        import("../views/goods/addGoods.vue"),
      meta: {
        title: "添加商品",
        index: 'addGoods'
      }
    },
    ]
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import("../views/login/login.vue"),
    meta: {
      title: "登录",
      index: '/'
    }
  },
  {
    path: "/:catchAll(.*)",
    name: "404",
    component: () =>
      import("../views/404/404.vue"),
    meta: {
      title: "404",
    }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string
  const user = JSON.parse(localStorage.getItem('xiaoai-user')!)
  if (to.path === '/login') {
    next()
  } else {
    user ? next() : next('/login')
  }
})
export default router;
