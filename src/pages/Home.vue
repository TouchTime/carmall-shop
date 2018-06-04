<template>
	<div class="home-page">
		<div class="wel-bar">
			<div class="logo"></div>
			<div class="user-avatar" @click="goMe">
				<div class="avatar-img" :style="'background-image:url('+(userInfo.headImg || '')+')'"></div>
			</div>
		</div>
		<div class="home-banner"><banner @handleShow="showDiscounts" @handleExclusive="showExclusive"/></div>
		<div class="home-product">
			<div class="classify-bar">
				<ul class="classify-list">
					<li :class="{'active':classifyIndex == index}" v-for="(item,index) in classifyData" :key="index" @click="switchSort(index)">{{item.title}}</li>
				</ul>
				<div class="more-btn" @click="isShowMoreNav = !isShowMoreNav"></div>
				<div v-if="isShowMoreNav" class="expand-menu">
					<ul>
						<li class="em-nav-item" v-for="(item,index) in classifyData" :key="index" @click="switchSort(index)">{{item.title}}</li>
					</ul>
				</div>
			</div>
			<div :class="{'classify-desc':true,'loading':isLoading}">
				<ul v-if="currDataList.length > 0" class="product-list">
					<li v-for="(item,index) in currDataList" :key="item.id">
						<div class="product-photo" @click="showDetail(item)"><img :src="item.product ? item.product.productImgUrl : ''" alt=""></div>
						<div class="product-desc">
							<h3>{{item.product ? item.product.name : '-'}}</h3>
							<p class="product-tags">
								<span v-if="(item.product ? (item.product.displayPrice ? true : false) : false)">特价</span>
							</p>
							<p class="product-price">
								<span class="now-price">¥ {{(item.product ? (item.product.actualPrice || 0) : 0).toFixed(2)}}</span>
								<span v-if="(item.product ? (item.product.displayPrice ? true : false) : false)" class="old-price">¥ {{(item.product ? (item.product.displayPrice || 0) : 0).toFixed(2)}}</span>
							</p>
							<p :class="{'product-count':true,'zero':item.productNumber < 1}">剩余库存：{{item.productNumber}}</p>
						</div>
						<div class="product-opts">
							<div class="opts-group">
								<div v-if="item.amount > 0" class="opts-subtract-btn" @click="subtractOpts(item)"></div>
								<div v-if="item.amount > 0" class="opts-num">{{item.amount}}</div>
								<div :class="{'opts-plus-btn':true,'disabled':item.productNumber<1}" @click="plusOpts(item)"></div>
							</div>
						</div>
					</li>
				</ul>
				<div v-else class="no-data">
					<p>该分类暂无商品，请查看其他分类！</p>
				</div>
			</div>
		</div>
		<div class="home-footer">
			<div :class="{'discounts-display':true,'show':discountText.length > 0}">{{discountText}}</div>
			<div class="home-footer-left">
				<div class="cart-btn" @click="showCart">
					<div class="badge">{{goodsStat.count}}</div>
				</div>
				<div class="total">
					<div class="total-col"><span>合计：</span><span>¥ </span><span>{{reducedPrice(goodsStat.total)}}</span></div>
				</div>
			</div>
			<div class="home-footer-right">
				<div :class="{'discounts-btn':true,'active':discountFactor.length > 0}" @click="showDiscountDetails">优惠</div>
				<div :class="{'account-btn':true,disabled:this.cartList.length<1}" @click="handleSettle">
					<span>{{payBtnText}}</span>
				</div>
			</div>
		</div>
		<transition name="showBuyList">
			<div v-if="isShowBuyList" ref="buyList" class="mask cart-layer" @click="closeCart">
				<div class="list-box">
					<div class="list-box-title">
						<div class="title-text">已选商品</div>
						<div class="close-btn" @click="isShowBuyList = false"></div>
					</div>
					<div class="list-box-body">
						<div v-if="cartList.length > 0">
							<ul class="buy-checklist">
								<li v-for="(item,index) in cartList" :key="item.id">
									<div class="goods-name">{{item.product.name}}</div>
									<div class="goods-price-amount">
										<div class="goods-price"><small>¥ </small><span>{{(item.product.actualPrice).toFixed(2)}}</span>
										</div>
										<div class="amount-opts">
											<span class="minus" @click="subtractOpts(item)"></span>
											<span>{{item.amount}}</span>
											<span :class="{'plus':true,'disabled':item.productNumber<1}" @click="plusOpts(item)"></span>
										</div>
									</div>
								</li>
							</ul>
						</div>
						<div v-else class="no-data">
							<p>购物车空空的...</p>
						</div>
					</div>
				</div>
			</div>
		</transition>
		<transition name="showDetail">
			<div v-if="isShowDetail" class="mask detail-box" @click="isShowDetail=false">
				<div class="detail-box-inner">
					<div class="goods-photo"><img :src="currGoods.product ? currGoods.product.productImgUrl : ''"></div>
					<div class="goods-desc">
						<p>{{currGoods.product ? currGoods.product.name : '-'}}</p>
						<p><small>{{currGoods.product ? currGoods.product.productContent : '-'}}</small></p>
						<p>
							<small>¥ </small><span>{{currGoods.product ? (currGoods.product.actualPrice).toFixed(2) : '-'}}</span>
							<span>/</span>
							<span>{{currGoods.product ? currGoods.product.unit : '-'}}</span>
						</p>
					</div>
				</div>
			</div>
		</transition>
		<transition name="discountsAd">
			<!-- 新手活动 -->
			<discounts v-if="isShowDiscounts" :discountsInfo="discountsInfo" :bindphone={isBindPhone} @closeMask="closeDiscounts" @complete="completeAd"/>
		</transition>
		<transition name="ddMask">
			<div v-if="ddShow" ref="ddMask" class="discounts-details mask" @click="hideDiscountDetails">
				<div class="discounts-details-box">
					<ul class="discounts-list">
						<li v-for="(item,index) in couponList" :key="item.id">
							<h3>{{item.discountName}}</h3>
							<p>{{item.discountDesc}}</p>
							<p>{{formatTime(item.startTime)}}-{{formatTime(item.endTime)}}</p>
						</li>
					</ul>
				</div>
			</div>
		</transition>
		<transition name="exclusiveMask">
			<!-- 专属活动 -->
			<exclusive v-if="exclusiveIsShow" :discountsInfo="exclusiveInfo" :bindphone={isBindPhone} @closeMask="hideExclusive" @complete="getExclusiveTicket"/>
		</transition>
	
	</div>
	
</template>
<script>
import Banner from '../components/Banner.vue';
import Discounts from '../components/Discounts.vue';
import Exclusive from '../components/Exclusive.vue';

import { tween, styler,easing } from 'popmotion';
import {
  WARequest,
  Pay,
  sessionStorage,
  formatMoney,
  storage,
  loginInfo
} from '../util.js';

import moment from 'moment';
moment.locale('zh-CN');
import redPacket from '../assets/redPacket.png';
import defaultAvatar from '../assets/user-avatar.png';

/**
*  需要用户ID，店铺ID；
*/


export default {
	components:{Banner,Discounts,Exclusive},
	data(){
		return {
			shopID : '',
			userID : '',
			userInfo:{},
			classifyIndex : 0,
			allDataList: [],
			cartData : [],
			currGoods : {},
			discountFactor:[],
			couponList:[],
			cateArr : [],
			currDiscount : {},
			activityId : '',
			isBindPhone : false,
			isShowBuyList:false,
			isShowDetail:false,
			isLoading : false,
			isShowDiscounts:false,
			discountsInfo : {},
			discountsID : '',
			isUserCancel : false,
			ddShow:false,
			payBtnText : '去结算',
			isLockPay : false, //防止重复添加结算
			isShowMoreNav : false,
			discountAllList : [],   // 所有可以参与的活动列表
			exclusiveIsShow: false,
			exclusiveInfo : {},
			exclusiveID : '',
			redPacket,
			discountText:'',
			
		}
	},
	created(){
		let listed = loginInfo();
		this.shopID = sessionStorage.get('shopID');
		this.userID = listed ? listed.user.id : '';
		this.userInfo = listed ? listed.user : {headImg : defaultAvatar,nickname : '车猫',phone:''};
		if(this.shopID && this.shopID !=""){
			this.querySort();
			this.queryShopInfo(this.shopID);
		}else{
			alert('店铺ID不存在，请检查二维码是否正确！');
		}
		if(listed){
			//查看用户是否已经绑定手机
			this.isBindPhone = listed.user.phone ? true : false;
			//查询店铺优惠活动列表
			this.queryDiscountAllList((res)=>{
				let dalArr = res.data.result;
				//查询用户是否已经参与了本店活动，方便后续购买
				if(dalArr.length < 1){
					console.warn('没有任何优惠！');
				}else{
					/* 判断活动 */
					dalArr.map((item,index)=> {
							//新手活动
						if (item.id == '80111213'){
							this.discountsInfo = item || '';
							//保存活动id
							this.discountsID = item ? item.id : '';
						}else{
							//专属活动
							this.exclusiveInfo = item || '';
							this.exclusiveID = item ? item.id : '';
						}
					});
				}
				//获取用户拥有的优惠列表
				this.queryDiscount();
			});
		}
	},
	computed:{
		currDataList:function() {
			if(this.classifyData.length > 0){
				let cpcd = this.classifyData.slice();
				let ncd = Object.assign({},cpcd[this.classifyIndex]);
				// 优化并列情况，当库存相同时，通过id大小来排列，从而避免sort函数并列时随机顺序导致商品上下移动
				ncd['listdata'].sort((a,b)=> {
					if(b['sortStock'] - a['sortStock'] !=0 ){
						return b['sortStock'] - a['sortStock']
					}else{
						return b['id'] - a['id']
					}
				});
				return ncd['listdata'];
			}else{
				return [];
			}
		},
		classifyData:function() {
			let classifyData = {};
			let tempArr = [];
			this.allDataList.forEach((item,index)=>{
				if(classifyData[item.cateId]){
					if(classifyData[item.cateId].listdata){
						classifyData[item.cateId].listdata = classifyData[item.cateId].listdata.concat(item);
					}else{
						classifyData[item.cateId].listdata = [item];
					}
				}else{
					classifyData[item.cateId] = {
						title : item.cateName,
						cateId : item.cateId,
						listdata : item ? [item]:[]
					}
				}
			});
			//添加菜单排序
			this.cateArr.forEach((item,index)=>{
				if(classifyData[item.id]){
					classifyData[item.id].sort = item.seq;
				}
			});
			for(let key in classifyData){
				tempArr.push(classifyData[key]);
			}
			//菜单数组排序
			tempArr.sort((a,b)=>(
				a.sort > b.sort
			));

			if(JSON.stringify(classifyData) == "{}"){
				return [{title : '全部分类',cateId : '',listdata : this.allDataList}];
			}else{
				return [{title : '全部分类',cateId : '',listdata : this.allDataList}].concat(tempArr);
			}
		},
		cartList : function() {
			return this.allDataList.length > 0 ? this.allDataList.filter((item,index)=>item.amount > 0) : [];
		},
		goodsStat : function(){
			let allCount = 0;
			let economy = 0;
			let total = 0;
			if(this.cartList.length > 0){
				this.cartList.forEach((item,index)=>{
					allCount = allCount + item.amount;
					economy = economy + (item.product.displayPrice - item.product.actualPrice)*item.amount*10;
					total = total + item.product.actualPrice*item.amount*10
				});
			}
			return {
				count:allCount,
				total:(total/10).toFixed(2),
				economy:(economy/10).toFixed(2)
			}
		},
		// discountText:function(){
		// 	let dfArr = this.discountFactor.slice();
		// 	let total = this.goodsStat.total;
		// 	if(dfArr.length > 0){
		// 		dfArr.sort((a,b)=>{
		// 			if(Number(b.sum) - Number(a.sum) == 0){
		// 				return Number(b.lowest) - Number(a.lowest);
		// 			}else{
		// 				return Number(b.sum) - Number(a.sum);
		// 			}
		// 		});
		// 		if(dfArr[0].lowest <= total){
		// 			this.currDiscount = dfArr ? dfArr[0] : {};
		// 			return dfArr[0].name;
		// 		}else{
		// 			dfArr = dfArr.filter((item,index)=>(item.lowest <= total));
		// 			dfArr.sort((a,b)=>(Number(b.lowest) - Number(a.lowest)));
		// 			this.currDiscount = dfArr ? dfArr[0] : {};
		// 			return dfArr.length > 0 ? dfArr[0].name : ``;
		// 		}
		// 	}else{
		// 		return '';
		// 	}
		// }
	},
	watch:{
		goodsStat:function(newValue, oldValue){
			let cartBtn = document.querySelector('.cart-btn');
			let cartBtnStyler = styler(cartBtn);
			if(newValue.count > oldValue.count){
				tween({
					from : {scale: 0.5 },
					to   : {scale: 1 },
					ease: easing.backOut,
					duration: 600
				}).start(cartBtnStyler.set);
			}
		}
	},
	methods:{
		switchSort(index){
			this.classifyIndex = index;
			this.isShowMoreNav = false;
		},
		querySort(){
			//查询分类
			this.isLoading = true;
			WARequest({
				url : `/platforms/platform/product/cate`,
				data : {
					page:1,
					size:100
				},
				done : (res)=>{
					this.cateArr = res.data.result;
					this.queryGoodsList({shopId : this.shopID});
				},
				fail : (err)=>{
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}else{
						alert('获取商品分类失败！');
					}
				}
			});
		},
		queryGoodsList(param){
			//查询商品列表
			WARequest({
				url : `/shops/shopproduct/getshopproductpage`,
				data : Object.assign({},{
					page:1,
					size:1000
				},param),
				done : (res)=>{
					this.isLoading = false;
					let allDataList = res.data.result.map((item,index)=>{
						//复制库存，方便后续排序
						item.sortStock = item.productNumber;
						return Object.assign({},item,{amount:0});
					});
					//恢复购物车
					const oldCartList = sessionStorage.get('cartList') || [];
					if(oldCartList.length > 0){
						oldCartList.forEach((v,i)=>{
							allDataList.forEach((item,index)=>{
								if(v.id == item.id){
									item.amount = v.amount;
									//修正库存数量
									item.productNumber = item.productNumber-item.amount;
								}
							});
						});
					}
					this.allDataList = allDataList;
				},
				fail : (err)=>{
					console.warn(err);
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}else{
						alert('获取商品列表失败!');
					}
				}
			})
		},
		queryShopInfo(shopid){
			//获取店铺列表
			WARequest({
				url : `/shops/shop/getshopinfo/${shopid}`,
				data : {},
				done : (res)=>{
					if(res.data){
						document.querySelector('title').innerText = '欢迎光临'+(res.data.shopName || '车猫车店');
					}else{
						alert('未找到店铺信息，请检查二维码是否正确！');
					}
				},
				fail : (err)=>{
					console.warn(err);
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}else{
						alert('获取店铺信息失败！');
					}
				}
			})
		},
		subtractOpts(row){
			//减少商品操作
			this.allDataList = this.allDataList.map((item,index)=>{
				if(item.id == row.id && item.cateId == row.cateId){
					return Object.assign({},item,{
						amount:item.amount - 1,
						productNumber:item.productNumber + 1
					});
				}else{
					return item;
				}
			});
		},
		plusOpts(row){
			//添加商品操作
			this.allDataList =this.allDataList.map((item,index)=>{
				if(item.id == row.id && item.cateId == row.cateId && item.productNumber > 0){
					return Object.assign({},item,{
						amount:item.amount + 1,
						productNumber:item.productNumber - 1
					});
				}else{
					return item;
				}
			});
		},
		showCart(){
			//显示购物车
			this.isShowBuyList = true;
		},
		closeCart(e){
			//关闭购物车
			if(this.$refs.buyList == e.target){
				this.isShowBuyList = false;
			}
		},
		showDiscounts(){
			this.isShowDiscounts = true;
		},
		handleSettle(){
			//立即结算
			if(this.isShowBuyList && this.cartList.length > 0){
				let buyList = this.cartList; //购物列表
				let currDiscount = this.currDiscount || ''; //当前可以使用的优惠
				// if(!this.isBindPhone && !this.isUserCancel){
				// 	//没绑电话且用户没有取消，显示优惠活动
				// 	this.showDiscounts();
				// }else{
					//领过了，直接支付
					if(!this.isLockPay){
						this.payBtnText = '支付中';
						this.isLockPay = true;
						this.queryPayOrder({
							isShow : 0,
							discountList : this.discountFactor.map((item,index)=>item.id).join(',')
						},(orderId) => {
							WARequest({
								url: `/orders/order/payorderunion/${orderId}`,
								method: 'POST',
								data: {
									uid: this.userID,
									payType: window.env ? {'wechat':2,'alipay':1,'browser':1}[window.env] : 1
								},
								done: (res) => {
									console.log(res)
									if (res.data.isOtherPay == 1) {
										Pay({
											appId: res.data.appId,
											timeStamp: res.data.timeStamp,
											nonceStr: res.data.nonceStr,
											package: res.data.packageurl,
											signType: res.data.signType,
											paySign: res.data.paySign,
											tradeNO: res.data.payOrderId,
											wapHtml: res.data.wapHtml,
											done: (res) => {
												this.payBtnText = '去结算';
												this.isLockPay = false;
												this.$router.push({
													name: 'paySucceed',
													query: {
														timestamp: (new Date()).getTime()
													}
												});
											},
											fail: (res) => {
												this.payBtnText = '去结算';
												this.isLockPay = false;
												this.$router.push({
													name: 'payFail',
													query: {
														timestamp: (new Date()).getTime()
													}
												});
											}
										});
									} else {
										//余额支付
										this.$router.push({
											name: 'paySucceed',
											query: {
												timestamp: (new Date()).getTime()
											}
										});
									}
								},
								fail: (err) => {
									this.payBtnText = '去结算';
									this.isLockPay = false;
									if(err.responseJSON){
										if (err.responseJSON.error_mesg) {
											alert(err.responseJSON.error_mesg);
										} else if (err.responseJSON.error) {
											alert(err.responseJSON.error);
										}
									}else{
										alert('支付订单失败！');
									}
								}
							});
						});
					//}
				}
			}else{
				//再次显示购物车
				this.showCart();
			}
		},
		showDetail(item){
			//显示商品详情
			this.currGoods = item;
			this.isShowDetail = true;
		},
		checkDiscountTicket(cb){
			//更换新的用户id
			let listed = loginInfo();
			//领取优惠
			if(this.discountsID){
				WARequest({
					url : `/promotions/discount/promotion/${this.discountsID}`,
					method : 'GET',
					data : {userId:listed.user.id},
					done : (res)=>{
						cb && cb(res.data);
					},
					fail : (err)=>{
						if(err.responseJSON){
							if (err.responseJSON.error_mesg) {
								alert(err.responseJSON.error_mesg);
							} else if (err.responseJSON.error) {
								alert(err.responseJSON.error);
							}
						}
					}
				})
			}else{
				console.warn('优惠ID，不存！');
			}
		},
		queryDiscount(cb){
			//查询用户优惠券
			WARequest({
				url : `/promotions/discount/user/${this.userID}`,
				method : 'GET',
				data: {},
				done:(res)=>{
					this.couponList = res.data;
					this.discountFactor = res.data.map((item,index)=>{
						return {
							id   : item.id,
							name : item.discountDesc,
							lowest : item.conditionList ? (item.conditionList[0] ? item.conditionList[0].downLimitSum : 0) : 0,
							sum : item.factorList ? (item.factorList[0] ? item.factorList[0].discountSum : 0) : 0,
							cartId:item.conditionList ? (item.conditionList[0] ? item.conditionList[0].cartId : '') : '',
							type: item.conditionList ? (item.conditionList[0] ? item.conditionList[0].type : '') : ''   //type:0 平台优惠； 1：店铺优惠  2：类目优惠
						}
					});
					cb && cb();
				},
				fail:(err)=>{
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}else{
						alert('查询优惠信息失败！');
					}
				}
			})
		},
		queryDiscountAllList(cb){
			//查询优惠列表
			WARequest({
				url : '/promotions/promotion/promotionList',
				data:{
					shopId : this.shopID,
					userId : this.userInfo.id
				},
				done:(res)=>{
					cb && cb(res);
				},
				fail:(err)=>{
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}else{
						console.warn('查询优惠活动列表失败！');
					}
				}
			});
		},
		queryUserParticipate(actId,cb){
			//查询用户是否可以参与优惠
			WARequest({
				url : '/promotions/promotion/user',
				method:'GET',
				data : {
					userId : this.userID,
					promotionId : actId
				},
				done:(res)=>{
					cb && cb(res);
				},
				fail:(err)=>{
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}else{
						console.warn('查询优惠活动列表失败！');
					}
				}
			})
		},
		goMe(){
			//去个人中心
			this.$router.push({
				name: 'me',
				query: {
					timestamp: (new Date()).getTime()
				}
			});
		},
		showDiscountDetails(){
			if(this.couponList.length > 0){
				this.ddShow = true;
			}
		},
		hideDiscountDetails(e){
			if(this.$refs.ddMask == e.target){
				this.ddShow = false;
			}
		},
		closeDiscounts(){
			//手动关闭活动提示
			this.isShowDiscounts = false;
			this.isUserCancel = true;
		},
		completeAd(cb){
			//绑定手机完成后，立即领取
			this.checkDiscountTicket((res)=>{
				let listed = loginInfo();
				this.userID = listed ? listed.user.id : '';
				this.userInfo = listed.user;
				this.isBindPhone = true;
				if(res){
					//领取成功，刷新优惠列表，自动更新优惠
					this.queryDiscount();
					this.isShowDiscounts = false;
					cb && cb();
				}else{
					console.log('领取优惠失败！');
				}
			});
		},
    queryPayOrder(param,cb) {
      const buyList = this.cartList;
			const buyUid = this.userID;
      if (buyList.length > 0) {
        let sendData = buyList.map((item, index) => {
          return {
            id: item.productId,
            shopId: item.shopId,
            ShopProductName: item.product.name,
            num: item.amount
          }
        });
        sendData = JSON.stringify(sendData);
        WARequest({
          url: `/orders/order/userbuyproduct/`,
          method: 'POST',
          data: Object.assign({},{
            buyUid: buyUid,
            shoppingWay:window.env ? {'wechat':2,'alipay':1}[window.env] : 1,
            orderType: 2,
            choosedShopProductList: sendData
          },param),
          done: (res) => {
            const {
              orderPay,
              orderUnionDtoList,
            } = res.data;
            cb && cb(orderPay.id);
          },
          fail: function(err) {
            if(err.responseJSON){
              if (err.responseJSON.error_mesg) {
                alert(err.responseJSON.error_mesg);
              } else if (err.responseJSON.error) {
                alert(err.responseJSON.error);
              }
            }else{
              alert('生成订单失败！');
            }
          }
        });
      } else {
        alert('订单列表不能为空！');
      }
    },
		formatTime(date){
      return moment(date).format("YYYY/MM/DD")
    },
		reducedPrice(total){
			//通过优惠计算总价格,遍历优惠限制
			if(this.cartList.length > 0){
				let discountCount = 0; //专属优惠
				let ndc = {}; //新手优惠
				let ddc = {};
				let pdc = {};  //平台优惠
				let low = 0;
				let far = 0;
				this.discountFactor.forEach((item,index)=>{
					console.log('item.cartId',item)
					//新增平台优惠
				
					// //判断是否有专属优惠
					// if(item.cartId){
					// 	const accordArr = this.cartList.filter((v,i)=>{
					// 		return v.cateId == item.cartId
					// 	});
					// 	if(accordArr.length > 0){
					// 		let cartTotal = 0;
					// 		//选购专属商品的总价
					// 		let lowest = item.lowest || 0;
					// 		accordArr.forEach((av,ai)=>{
					// 			cartTotal = Number(cartTotal) + (av.product.actualPrice*av.amount);
					// 		});
					// 		// 总价必须要大于最低要求
					// 		if(Number(cartTotal) >= lowest){
					// 			discountCount = item.sum;
					// 			ddc = item;
					// 		}
					// 	}
					// }else{
					// 	ndc = item ;
					// }
                      ndc = item;



				});
				//通用优惠,专属优惠小于新手优惠时，使用新手
				// if(discountCount == 0){
				// 	discountCount = ndc.sum || 0;
				// 	this.discountText = ndc.name || '';
				// }else{
				// 	this.discountText = ddc.name || '';
				// }
				
				// if((Number(total) - discountCount) <= 0){
				// 	return (discountCount > 0) ? 0.01 : 0.00;
				// }else{
				// 	return (total - discountCount).toFixed(2);
				// }
				console.log('this.discountFactor',this.discountFactor)
			    // this.discountFactor.forEach((item,index) => {
				// 	if(item.sum == 10) {
				// 		discountCount = 3;
				// 		console.log(total,discountCount,'最金额，优化金额');
				// 	}else if(item.sum == 20){
				// 		discountCount = 10;
				// 		console.log(total,discountCount,'最金额，优化金额');
				// 	}else{
				// 		discountCount = 0;
				// 		console.log(total,discountCount,'最金额，优化金额');
				// 	}
				// })
				if(Number(total) >= 10 && Number(total) < 20){
					this.discountFactor.forEach((item,index) => {
					if(item.lowest == 10) {
						discountCount = item.sum;
					}
				  })
                   return (Number(total) - discountCount).toFixed(2);
				}else if( Number(total) >= 20){
					this.discountFactor.forEach((item,index) => {
					if(item.lowest == 20) {
						discountCount = item.sum;
					}
				})
					return (Number(total) - discountCount).toFixed(2);
				}else{
					discountCount = 0;
					return  Number(total)
				}
				
			}else{
				this.discountText='';
				return total
			}
		},
		showExclusive(){
			this.exclusiveIsShow = true;
		},
		hideExclusive(e){
			this.exclusiveIsShow = false;
		},
		//领取专属优惠
		getExclusiveTicket(){
			//更换新的用户id
			let listed = loginInfo();
			//领取专属优惠
			if(this.exclusiveID){
				WARequest({
					url : `/promotions/discount/promotion/${this.exclusiveID}?userId=${listed.user.id}`,
					method : 'GET',
					data : {},
					done : (res)=>{
						let listed = loginInfo();
						this.userID = listed ? listed.user.id : '';
						this.userInfo = listed.user;
						this.isBindPhone = true;
						if(res){
							//领取成功，刷新优惠列表，自动更新优惠
							this.queryDiscount();
							this.hideExclusive();
							cb && cb();
						}else{
							console.log('领取优惠失败！');
						}
					},
					fail : (err)=>{
						if(err.responseJSON){
							if (err.responseJSON.error_mesg) {
								alert(err.responseJSON.error_mesg);
							} else if (err.responseJSON.error) {
								alert(err.responseJSON.error);
							}
						}else{
							alert('领取失败！');
						}
					}
				});
			}else{
				console.warn('优惠ID，不存！');
			}
		}
	},
	beforeDestroy(){
		sessionStorage.set('cartList',this.cartList);
	}
}
</script>

<style>
.home-page{
	background-color: #fff!important;
	overflow: hidden;
	& .wel-bar{
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 46px;
		padding: 0 0 0 0.5em;
		background-color: #ffc702;
		& .logo{
			width: 11em;
			height: 46px;
			background: url('../assets/new-logo.png') no-repeat 50% 50% / 100%;
		}
		& .user-avatar{
			width: 46px;
			height: 46px;
			display: flex;
			align-items: center;
			justify-content: center;
			& .avatar-img{
				width: 32px;
				height: 32px;
				border-radius: 16px;
				background-color: #fff;
				background-position: center;
				background-repeat: no-repeat;
				background-size: cover;
			}
		}
	}
	& .home-banner{
		position: relative;
		height: 78px;
		background-color: #eee;
		@media screen and (min-width: 359px){
			height: 86px;
		}
		@media screen and (min-width: 410px){
			height: 94px;
		}
	}
	& .home-product{
		position: absolute;
		top: calc(78+46)px;
		left: 3%;
		bottom: 50px;
		width: 94%;
		background-color: #fff;
		@media screen and (min-width: 359px){
			top: calc(86+46)px;
		}
		@media screen and (min-width: 410px){
			top: calc(94+46)px;
		}
		& .classify-bar{
			position: relative;
			height: 44px;
			padding: 0 1.6em 0 0;
			box-sizing: border-box;
			/* overflow: hidden; */
			&::before{
				content : '';
				position: absolute;
				top: 0;
				left: 0;
				width: 1em;
				height: 100%;
				background:linear-gradient(to right,#fff 0,rgba(255,255,255,0) 100%);
				z-index: 10;
			},
			&::after{
				content : '';
				position: absolute;
				top: 0;
				right: 1.5em;
				width: 1em;
				height: 100%;
				background:linear-gradient(to left,#fff 0,rgba(255,255,255,0) 100%);
				z-index: 10;
			}
			& .expand-menu{
				position: absolute;
				top: 100%;
				left: 0;
				width: 100%;
				padding: 0.5em 0.5em 2em 0.5em;
				background:linear-gradient(to bottom,#fff 0,#f6f6f6 100%);
				box-sizing: border-box;
				z-index: 6;
				& ul{
					display: flex;
					flex-wrap: wrap;
				}
				& li{
					width: 25%;
					margin: 0 0 1.1em 0;
					flex-shrink: 0;
					color: #666;
					text-align: center;
				}
			}
			& .more-btn{
				position: absolute;
				top: 0;
				right: 0;
				width: 1.5em;
				height: 100%;
				background-color: #fff;
				&:after{
					content : '';
					position: absolute;
					top: 40%;
					width: 0.8em;
					height: 0.8em;
					left: 60%;
					margin: -0.5em 0 0 -0.5em;
					border-bottom: 1px solid #999;
					border-right: 1px solid #999;
					transform: rotate(45deg);
				}
			}
		}
		& .classify-indicator{
			position: absolute;
			left: 0;
			bottom: 6px;
			width:4.5em;
			border-bottom: 2px solid #ffc702;
			transition: all 0.3s;
		}
		& .classify-list{
			position: relative;
			display: flex;
			line-height: 44px;
			font-size: 1.05em;
			overflow-x: auto;
			overflow-y: hidden;
			& li{
				position: relative;
				width: 4.6em;
				flex-shrink: 0;
				text-align: center;
				margin-right: 1em;
				color: #888;
				&:first-child{
					margin-left:0.5em;
				}
				&:last-child{
					margin-right: 1.6em;
				}
				&.active{
					color: #333;
					&::after{
						content :'';
						position: absolute;
						bottom: 4px;
						left: 0;
						width: 100%;
						height: 2px;
						background-color: #ffc702;
					}
				}
			}
		}
		& .classify-desc{
			position: absolute;
			top: 44px;
			bottom: 12px;
			width: 100%;
			overflow-x: hidden;
			overflow-y: auto;
			&.loading{
				overflow: hidden;
			}
			&.loading::after{
				content: '数据加载中...';
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				padding: 5em 0;
				background-color: #fff;
				box-sizing: border-box;
				text-align: center;
				color: #999;
			}
		}
		& .product-list li{
			position: relative;
			display: flex;
			align-items: flex-end;
			font-size: 94%;
			padding: 0.8em 0;
			&::after{
				content:'';
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 1px;
				background-color: #eee;
				transform: scaleY(0.8);
			}
			&:last-child::after{
				display: none;
			}
			& .product-photo{
				width: 26%;
				flex-shrink: 0;
				@media screen and (min-width: 359px){
					width: 28%;
				}
				@media screen and (min-width: 410px){
					width: 30%;
				}
			}
			& .product-tags span{
				display: inline-block;
				line-height: 1.4em;
				border-radius: 1em;
				padding: 0 0.8em;
				margin: 0 0.5em 0 0;
				border: 1px solid #ffc702;
				font-size: 90%;
				color: #ffc702;
			}
		}
		& .product-desc{
			flex-grow: 1;
			padding: 0 0.5em 0 1.5em;
			overflow: hidden;
			& h3{
				margin: 0;
				font-weight: normal;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			& p{
				margin: 0.4em 0;
			}
		}
		& .product-count{
			color: #999;
			&.zero{
				color: red;
			}
		}
		& .product-price span{
			display: inline-block;
			margin-right: 0.5em;
		}
		& .product-price .now-price{
			font-weight: bold;
			color: #fc5b1f;
		}
		& .product-price .old-price{
			text-decoration: line-through;
			color: #666;
		}
		& .product-opts{
			width: 6em;
			flex-shrink: 0;
		}
		& .opts-group{
			display: flex;
			align-items: center;
			justify-content: flex-end;
			padding: 0 0 0.4em 0;
			& .opts-subtract-btn,& .opts-plus-btn{
				width: 24px;
				height: 24px;
				border-radius: 100%;
				background-color: #eee;
				box-shadow: 0 0 4px rgba(0,0,0,0.1);
				box-sizing: border-box;
			}
			& .opts-subtract-btn{
				background: #eee url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAACHklEQVR4nO3ZPWuTURgG4Puk9YsuOghtdXJzS7LYQVDQTfwNzm6Ci5u/xX/gLqKic2OHSkFwUluQLtKC8es4ZHARkxOjieW6xpdzn3PzhifDexIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgaCqtgW63201yesY9lpIsJ6lJvib5PoM9u7949nIG+x4FnST9jH7/b/n5vo/c+6m1vt7a2no3bX7iAen1etc7nc79JJenPQzm5MHh4eHdnZ2d/dbg8iSL+v3+RinlUXsvWAi3VlZWLia51BpcmmTR+vr6syRnWjeHBXJubW3ty+7u7vOWUGfcgn6/fzPJhalrwYIopdxuzYwdkFrr2enqwMI53xoYOyCllPfTdYGF87E1MHZAhsPhi1rrwXR9YKE8bA2MHZDt7e2DWuud6frAYqi1fkhyrzU30Vesvb29werq6ptSypUkp1oPgTl7Umu9sbm5+bY12HyT3uv1rpVSNpIca83+xvEkJzO61R1mdJv+p67OYI9xnv6DM/6G5SQnMvqD/JTk83zr/B211v0kjweDwat5dwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA/8gPsNRV1KRM0XUAAAAASUVORK5CYII=') no-repeat 50% 50% / 60%;
			}
			& .opts-plus-btn{
				background: #ffc702  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAD1UlEQVR4nO3ZwaulcwDG8edolGKBUhZKDX8AGUxigy07lrZSFmIjFigL/4KFYmGNnQ2zUVM27oqFxuLWoDSapikbOha3i0nzvO97zHve457PZ3W75/frPN3O957uPQkAAAAAAACwd1ZDB9br9TZ27LuzSW5Jcpjkh4W3nGir1eBL/ho3zbSDcZ5LcpDkfJJzSS4k+STJ6SVH8TfvIMt5Nsln13nsQpIzSS5vb85+8A7y/3Bnkg/L4/cleW87U2gEsoznk9wxcObFbQyhE8gy7h557v5ZVzBIIMs4NfLcbbOuYJBAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUBxaoM7DyS5/UYP2TP3jjx3Jn7W/9X3SS5uenk1dGC9Xh9/+XSSt5I8vumTwUI+SvJakkur1eBL/hpjAzmb5Pwmy2BHfJ3k0amBjP0b5OPJc2C3PJLkjamXxgTyTJLTk+fA7nlp6oUxgdy1wRDYRfdMvTAmkB83GAK76MrUC2MC+SrJ1elbYOd8OvXCmECuJnll+hbYKb8keX3qpbH/xfogyQtJfp36BLADziV5OMlPUy9O+aDw2FM5+lzk5qlPxl+eTPLEiHPvJ/l55i0n2aUkXyT59vgbc31QyI31bpI3R5x7MMnBzFv2ylwfFMJeEggUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCGQZfwx8tzvs65gkECWcXHkucNZVzBIIMv4fMSZL5NcmXsInUCWcZjk7fL4b0le3s4UGoEs550kr+Yohn/6JsljSb7b+iL+ZTV0YL1eb2PHPrs1yUM5+mV1OcnBsnNOttVq8CUPAAAAAAAAAFzXn8z6THnqQs4vAAAAAElFTkSuQmCC') no-repeat 50% 50% / 60%;
				transition: all 0.3s;
				&.disabled{
					background:#eee url('data:image/png;base64,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') no-repeat 50% 50% / 60%; ;
				}
			}
			& .opts-num{
				width: 2em;
				text-align: center;
			}
		}
	}
	& .home-footer{
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 46px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;
		box-shadow: 0 0 4px rgba(0,0,0,0.1);
		z-index: 12;
		& .discounts-display{
			position: absolute;
			bottom: 100%;
			left: 0;
			width: 100%;
			line-height: 2em;
			font-size: 90%;
			background-color:rgba(100,100,100,0.8);
			text-align: center;
			transition: all 0.3s;
			transform: translate3d(0,100%,0);
			opacity: 0;
			z-index: -1;
			&.show{
				transform: none;
				opacity: 1;
				z-index: 1;
				color: #fff;
			}
		}
		& .home-footer-right{
			display: flex;
			align-items: center;
			& .discounts-btn{
				width: 4.5em;
				line-height: 46px;
				text-align: center;
				background-color: #eee;
				color: #999;
				&.active{
					background-color: #ffc702;
					color: #333;
				}
			}
		}
		& .account-btn{
			position: relative;
			height: 46px;
			width: 6.5em;
			line-height: 50px;
			text-align: center;
			background-color: #fc5b1f;
			font-weight: 600;
			transition:all 0.3s;
			color: #fff;
			&.disabled{
				background-color: #ccc;
			}
			&>span{
				position: relative;
				display: inline-block;
				&::after{
					content: '';
					position: absolute;
					top: 50%;
					left: 110%;
					width: 0;
			    height: 0;
					margin-top: -6.5px;
			    border-top: 6px solid transparent;
			    border-left: 10px solid #fff;
			    border-bottom: 6px solid transparent;
				}
			}
		}
	}
	& .no-data{
		padding: 5em 0;
		text-align: center;
		color: #999;
	}
	& .home-footer-left{
		display: flex;
		align-items: center;
		padding: 0 0 0 0.5em;
	}
	& .cart-btn{
		position: relative;
		width: 40px;
		height: 40px;
		border-radius: 100%;
		background-image: url('../assets/shoppingCart.png');
		background-repeat: no-repeat;
		background-position: center;
		background-size: 3em;
		background-color: #ffc700;
		& .badge {
			position: absolute;
			right: -2px;
			top: -2px;
			width: 18px;
			height: 18px;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #fff;
			font-size: 8px;
			border-radius: 100%;
			background-color: #333;
		}
	}
	& .total{
		margin-left: 0.5em;
		& .total-col{
			line-height: 1.2em;
		}
		@media screen and (min-width:359px) {
			display: flex;
			align-items: center;
			& .total-col{
				font-size: 1em;
				margin-right: 0.5em;
			}
		}
		& small{
			color: #ffc700;
		}
	}
	& .cart-layer{
		& .list-box{
			position: absolute;
			bottom: 46px;
			left: 0;
			width: 100%;
			padding: 0 4% 1.8em 4%;
			box-sizing: border-box;
			background-color: #fff;
		}
		& .list-box-title{
			height: 2.8em;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1px solid #eee;
			color: #999;
		}
		& .close-btn {
			position: relative;
			width: 1.4em;
			height: 1.4em;
			transform: rotate(45deg);
			opacity: 0.6;
		}
		& .close-btn::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			width: 100%;
			height: 1px;
			background-color: #666;
			transform: translateY(-50%);
		}
		& .close-btn::after {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			width: 1px;
			height: 100%;
			background-color: #666;
			transform: translateX(-50%);
		}
		& .list-box-body{
			padding: 0 0 0.5em 0;
		}
		& .buy-checklist li {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.8em 0;
			&::after{
				content:'';
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 1px;
				background-color: #f3f3f3;
				transform: scaleY(0.8);
			}
			&:last-child::after {
				display: none;
			}
			& .goods-name{
				flex-grow: 1;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
				padding-right: 0.5em;
				box-sizing: border-box;
			}
			& .goods-price-amount {
				display: flex;
				flex-shrink: 0;
				align-items: center;
				justify-content: space-between;
			}
			& .goods-price {
				font-size: 1.2em;
				padding-right: 1em;
				color: #db4727;
			}
			& .amount-opts span {
				display: inline-block;
				vertical-align: middle;
				width: 2em;
				text-align: center;
			}
			& .minus,
			& .plus {
				position: relative;
				width: 22px !important;
				height: 22px !important;
				border-radius: 100%;
				box-shadow: 0 0 1px rgba(0,0,0,0.4);
				box-sizing: border-box;
			}
			& .minus{
				background: #eee url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAACHklEQVR4nO3ZPWuTURgG4Puk9YsuOghtdXJzS7LYQVDQTfwNzm6Ci5u/xX/gLqKic2OHSkFwUluQLtKC8es4ZHARkxOjieW6xpdzn3PzhifDexIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgaCqtgW63201yesY9lpIsJ6lJvib5PoM9u7949nIG+x4FnST9jH7/b/n5vo/c+6m1vt7a2no3bX7iAen1etc7nc79JJenPQzm5MHh4eHdnZ2d/dbg8iSL+v3+RinlUXsvWAi3VlZWLia51BpcmmTR+vr6syRnWjeHBXJubW3ty+7u7vOWUGfcgn6/fzPJhalrwYIopdxuzYwdkFrr2enqwMI53xoYOyCllPfTdYGF87E1MHZAhsPhi1rrwXR9YKE8bA2MHZDt7e2DWuud6frAYqi1fkhyrzU30Vesvb29werq6ptSypUkp1oPgTl7Umu9sbm5+bY12HyT3uv1rpVSNpIca83+xvEkJzO61R1mdJv+p67OYI9xnv6DM/6G5SQnMvqD/JTk83zr/B211v0kjweDwat5dwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA/8gPsNRV1KRM0XUAAAAASUVORK5CYII=') no-repeat 50% 50% / 60%;
			}
			& .plus{
				background: #ffc702  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAD1UlEQVR4nO3ZwaulcwDG8edolGKBUhZKDX8AGUxigy07lrZSFmIjFigL/4KFYmGNnQ2zUVM27oqFxuLWoDSapikbOha3i0nzvO97zHve457PZ3W75/frPN3O957uPQkAAAAAAACwd1ZDB9br9TZ27LuzSW5Jcpjkh4W3nGir1eBL/ho3zbSDcZ5LcpDkfJJzSS4k+STJ6SVH8TfvIMt5Nsln13nsQpIzSS5vb85+8A7y/3Bnkg/L4/cleW87U2gEsoznk9wxcObFbQyhE8gy7h557v5ZVzBIIMs4NfLcbbOuYJBAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUBxaoM7DyS5/UYP2TP3jjx3Jn7W/9X3SS5uenk1dGC9Xh9/+XSSt5I8vumTwUI+SvJakkur1eBL/hpjAzmb5Pwmy2BHfJ3k0amBjP0b5OPJc2C3PJLkjamXxgTyTJLTk+fA7nlp6oUxgdy1wRDYRfdMvTAmkB83GAK76MrUC2MC+SrJ1elbYOd8OvXCmECuJnll+hbYKb8keX3qpbH/xfogyQtJfp36BLADziV5OMlPUy9O+aDw2FM5+lzk5qlPxl+eTPLEiHPvJ/l55i0n2aUkXyT59vgbc31QyI31bpI3R5x7MMnBzFv2ylwfFMJeEggUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoFCIFAIBAqBQCGQZfwx8tzvs65gkECWcXHkucNZVzBIIMv4fMSZL5NcmXsInUCWcZjk7fL4b0le3s4UGoEs550kr+Yohn/6JsljSb7b+iL+ZTV0YL1eb2PHPrs1yUM5+mV1OcnBsnNOttVq8CUPAAAAAAAAAFzXn8z6THnqQs4vAAAAAElFTkSuQmCC') no-repeat 50% 50% / 60%;
				transition: all 0.3s;
				&.disabled{
					background: #eee url('data:image/png;base64,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') no-repeat 50% 50% / 60%;;
				}
			}
		}
	}
	& .showBuyList-enter-active{
		animation: fadeIn 0.2s;
		& .list-box{
			animation: fadeInUp 0.2s ease;
		}
	}
	& .showBuyList-leave-active{
		animation: fadeIn 0.2s reverse;
		& .list-box{
			animation: fadeInUp 0.2s ease reverse;
		}
	}
	& .detail-box{
		z-index: 20;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		@media screen and (min-width: 359px){
			font-size: 1.1em;
		}
		@media screen and (min-width: 410px){
			font-size: 1.2em;
		}
		& .detail-box-inner{
			background-color: #fff;
			text-align: center;
			width: 76%;
			margin: 0 auto;
			padding: 1.4em 1em;
			border-radius: 0.4em;
			box-sizing: border-box;
			overflow: hidden;
		}
		& .goods-photo{
			width: 76%;
			max-width: 220px;
			max-height: 220px;
			margin: 0 auto 1em auto;
		}
	}
	& .showDetail-enter-active{
		animation: fadeIn 0.2s;
		& .detail-box-inner{
			animation: zoomIn 0.2s;
		}
	}
	& .showDetail-leave-active{
		animation: fadeIn 0.2s reverse;
		& .detail-box-inner{
			animation: zoomIn 0.2s ease reverse;
		}
	}
	& .discountsAd-enter-active{
		animation: fadeIn 0.2s;
		& .discounts-ad-box{
			animation: zoomIn 0.2s;
		}
	}
	& .discountsAd-leave-active{
		animation: fadeIn 0.2s reverse;
		& .discounts-ad-box{
			animation: zoomIn 0.2s reverse;
		}
	}
	& .discounts-details{
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
		& .discounts-details-box{
			width: 80%;
			margin: 0 auto;
			max-height: 360px;
			border-radius: 0.2em;
			background-color: rgba(255,255,255,1);
			overflow: auto;
		}
		& .discounts-list{
			padding: 0.5em 1em 0 1em;
			& li{
				position: relative;
				padding: 0.5em 1em;
				margin: 0 0 0.5em 0;
				background-color: #ffc702;
				color: #333;
				&::after{
					content:'';
					position: absolute;
					top: 0;
					right: -0.5em;
					width: 1em;
					height: 100%;
					background: #ffc702;
					background: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 4px, #ffc702 4px);
					background-size: 11px 15px;
					background-position: 9px 3px;
				}
				&::before{
					content:'';
					position: absolute;
					top: 0;
					left: -0.5em;
					width: 1em;
					height: 100%;
					background: #ffc702;
					background: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 4px, #ffc702 4px);
					background-size: 16px 15px;
					background-position: 9px 3px;
				}
			}
			& h3{
				margin: 0.2em 0;
			}
		}
	}
	& .ddMask-enter-active{
		animation: fadeIn 0.2s;
		& .discounts-details-box{
			animation: fadeInUp 0.2s ease;
		}
	}
	& .ddMask-leave-active{
		animation: fadeIn 0.2s reverse;
		& .discounts-details-box{
			animation: fadeInUp 0.2s ease reverse;
		}
	}

	& .exclusiveMask-enter-active{
		animation: fadeIn 0.2s;
	}
	& .exclusiveMask-leave-active{
		animation: fadeIn 0.2s reverse;
	}
	/* & .popUp-enter-active{
		animation: fadeIn 0.3s;
	}
	& .popUp-leave-active{
		animation: fadeIn 0.3s reverse;
	} */
}

</style>
