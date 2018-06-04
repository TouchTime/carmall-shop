import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

import Home from './pages/Home.vue';
import PaySucceed from './pages/PaySucceed.vue';
import PayFail from './pages/PayFail.vue';
import ProList from './pages/ProList.vue';
import Me from './pages/Me.vue';
import MyOrders from './pages/MyOrders.vue';
import Coupon from './pages/Coupon.vue';

import {reAuthorization,share,userLogin,gqs,initWechatApi,sessionStorage,storage} from './util.js';

Vue.use(VueRouter);
const router = new VueRouter({
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home
		},{
			path: '/paySucceed',
			name: 'paySucceed',
			component: PaySucceed
		} , {
			path: '/payFail',
			name: 'payFail',
			component: PayFail
		}, {
			path: '/proList',
			name: 'proList',
			component: ProList
		},{
			path: '/me',
			name: 'me',
			component: Me
		},{
			path:'/myorders',
			name:'myorders',
			component : MyOrders
		},{
			path : '/coupon',
			name : 'coupon',
			component : Coupon
		}
	]
});

//没有店铺ID的提示页面
const warnPageNode = document.querySelector('#warnPage');

//应用初始化
function init() {
	const state = gqs('state').split('YYBB');
	const shopID = state[1];
	if(shopID && shopID !=''){
		sessionStorage.set('shopID', shopID);
		const app = new Vue({
			router,
			render: h => h(App)
		}).$mount('#app');

		initWechatApi();//初始化 wechat JSSDK;
		share();  //初始化微信分享

		warnPageNode.parentElement.removeChild(warnPageNode);
	}else{
		warnPageNode.classList.remove('hide');
	}
}

//检查code
if(gqs('code')){
	//获取用户信息和Token
	userLogin(gqs('code'),init);
}else{
	//查看本地token
	if(storage.get('loginInfo')){
		init();
	}else{
		reAuthorization();
	}
}
