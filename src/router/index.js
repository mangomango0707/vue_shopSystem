import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入各个vue组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import GoodsList from '../components/goods/GoodsList'
import AddGood from '../components/goods/AddGood'
import Order from '../components/order/Order'
import Report from '../components/report/Report'

Vue.use(VueRouter)

// 路由所导向的组件
const routes = [
    // 重定向
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: Users },
            { path: '/roles', component: Roles },
            { path: '/rights', component: Rights },
            { path: '/categories', component: Cate },
            { path: '/params', component: Params },
            { path: '/goods', component: GoodsList },
            { path: '/goods/add', component: AddGood },
            { path: '/orders', component: Order },
            { path: '/reports', component: Report }
        ]
    }
]

const router = new VueRouter({
    routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to代表将要访问的
    // from代表从哪个地方来的
    // next():代表放行 next('/login'):代表强制跳转
    if (to.path === '/login') {
        return next();
    }
    const tokenStr = window.sessionStorage.getItem("token");
    if (!tokenStr) {
        return next('/login');
    }
    next();
})

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}


export default router