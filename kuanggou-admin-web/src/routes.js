import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'

import Brand from './views/product/Brand'
import ProductType from './views/product/ProductType'
import Product from './views/product/Product'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        leaf: true,//只有一个节点
        children: [
            { path: '/myPage', component: echarts, name: '首页' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '商品管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/brand', component: Brand, name: '品牌管理'},
            { path: '/productType', component: ProductType, name: '类型管理' },
            { path: '/specification', component: Form, name: '属性管理' },
            { path: '/product', component: Product, name: '商品管理' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'fa fa-id-card-o',
        children: [
            { path: '/page4', component: Page4, name: '员工管理' },
            { path: '/page5', component: Page5, name: '部门管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '营销管理',
        iconCls: 'fa fa-address-card',
        children: [
            { path: '/page6', component: Page6, name: '营销活动管理' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;