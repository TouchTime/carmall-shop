<template>
<div :class="{'buylist-page':true,'loading':isLoading}">
  <div class="roll-box">
    <h3>商品清单</h3>
    <div class="pay-section" v-for="(morder,mindex) in orderAllList" :key="mindex">
      <ul class="buy-list">
        <li class="list-item" v-for="(item,index) in morder.orderList" :key="item.id">
          <div class="list-img" :style="'background-image:url('+item.productUrl+')'"></div>
          <div class="list-text">{{item.productName}}</div>
          <div class="list-num"><span>X </span><span>{{item.numbers}}</span></div>
          <div class="list-price"><span class="red-font">￥{{(item.productPrice).toFixed(2)}}</span><span> 元</span></div>
        </li>
      </ul>
      <div class="buylist-pay-bar">
        <span>共</span><span class="red-font">{{goodsTotal}}</span><span>件商品，</span>
        <span>合计:</span>
        <strong class="red-font">￥ {{morder.paySum.toFixed(2)}} 元</strong>
        <span class="old-price">¥ {{morder.totalSum.toFixed(2)}} 元</span>
      </div>
    </div>
    <div v-if="(JSON.stringify(discountsInfo) !='{}') || (couponList.length > 0)" class="discounts-coupon-area">
      <div v-if="JSON.stringify(discountsInfo) !='{}'" class="discounts-row"><span>享受优惠：</span><span>{{discountsInfo.name}}满{{discountsInfo.lowest}}减{{discountsInfo.sum}}</span></div>
      <div v-if="couponList.length > 0">
        <h3>选择优惠券</h3>
        <div class="coupon-list">
          <div v-for="(item,index) in couponList" :key="item.id" :class="{'coupon-item':true,'active':selectIndex == index}" @click="selectItem(index)">
            <div class="coupon-item-inner">
              <div class="coupon-desc">
                <h3>{{item.discountName}}</h3>
                <p>{{item.discountDesc}}</p>
                <p>{{formatTime(item.startTime)}}-{{formatTime(item.endTime)}}</p>
              </div>
              <div class="coupon-money"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="actual-payment-bar"><span>实际支付：</span><span class="red-font">¥ {{(orderPay.payActualSum || 0).toFixed(2)}} 元</span></div>
  </div>
  <div :class="{'confirm-payment-btn':true}" @click="confirmPay">确认支付</div>
</div>
</template>
<script>
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

export default {
  data() {
    return {
      orderPay : {},
      orderAllList: [],
      userID : '',
      discountsInfo:'', //平台优惠
      couponList : [], //个人优惠券列表
      selectIndex : -1,
      isLoading: true,
    }
  },
  created() {
    let listed = loginInfo();
    this.isLoading = true;
    this.userID = listed ? listed.user.id : '2000000001';
    const gainDiscount = sessionStorage.get('GainDiscount') || {};
    this.discountsInfo = gainDiscount;
    //优惠id不存在
    if(gainDiscount.id ){
      this.queryPayOrder({
        isShow : 1,
        discountList:gainDiscount.id
      },()=>{
        this.isLoading = false;
      });
    }else{
      this.queryPayOrder({
        isShow : 1,
      },()=>{
        this.isLoading = false;
      });
    }
    this.queryCouponList(this.userID);
  },
  computed:{
    goodsTotal: function(){
      let sum = 0;
      this.orderAllList.forEach((item,index)=>{
        item.orderList.forEach((v,i)=>{
          sum = sum + v.numbers;
        });
      });
      return sum
    }
  },
  methods: {
    confirmPay() {
      let sendList = [];
      const did =  this.selectIndex >= 0 ? this.couponList[this.selectIndex].id : '';
      this.discountsInfo && this.discountsInfo.id  && sendList.push(this.discountsInfo.id);
      did && sendList.push(did);

      this.queryPayOrder({
        isShow : 0,
        discountList : sendList.toString()
      },(orderId) => {
        WARequest({
          url: `/orders/order/payorderunion/${orderId}`,
          method: 'POST',
          data: {
            uid: this.userID,
            payType: window.env ? {'wechat':2,'alipay':1}[window.env] : 1
          },
          done: (res) => {
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
                  this.$router.replace({
                    name: 'paySucceed',
                    query: {
                      timestamp: (new Date()).getTime()
                    }
                  });
                },
                fail: (res) => {
                  this.$router.replace({
                    name: 'payFail',
                    query: {
                      timestamp: (new Date()).getTime()
                    }
                  });
                }
              });
            } else {
              //余额支付
              this.$router.replace({
                name: 'paySucceed',
                query: {
                  timestamp: (new Date()).getTime()
                }
              });
            }
          },
          fail: (err) => {
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
    },
    queryPayOrder(param,cb) {
      const buyList = sessionStorage.get('BuyList') || [];
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
            buyUid: this.userID,
            shoppingWay:window.env ? {'wechat':2,'alipay':1}[window.env] : 1,
            orderType: 2,
            choosedShopProductList: sendData
          },param),
          done: (res) => {
            const {
              orderPay,
              orderUnionDtoList,
            } = res.data;
            if (orderUnionDtoList) {
              this.orderAllList = orderUnionDtoList;
            }
            this.orderPay = orderPay || {};
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
        alert('生成订单失败，请重试！');
      }
    },
    queryCouponList(uid){
      WARequest({
				url :`/promotions/discount/user/${uid}`,
				method : 'GET',
				data : {},
				done : (res)=>{
          this.couponList = res.data.result;
				},
				fail : (err)=>{
					console.warn(err);
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}
				}
			})
    },
    selectItem(index){
      console.log(index);
      if(this.selectIndex == index){
        this.selectIndex = -1
      }else{
        this.selectIndex = index;
      }
      let sendData = [];
      const did =  this.selectIndex >= 0 ? this.couponList[this.selectIndex].id : '';
      this.discountsInfo && this.discountsInfo.id  && sendData.push(this.discountsInfo.id);
      did && sendData.push(did);

      this.isLoading = true;
      this.queryPayOrder({
        isShow : 1,
        discountList : sendData.toString()
      },()=>{
        this.isLoading = false;
      });
    },
    //千分法格式化金额
    humanMoney(num) {
      return formatMoney(num);
    },
    formatTime(date){
      return moment(date).format("YYYY/MM/DD")
    }
  },
  destroyed() {
    sessionStorage.delete('BuyList');
    sessionStorage.delete('GainDiscount');
  }
}
</script>
<style>
.buylist-page {
  &.loading::after {
    content: '数据加载中...';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & .roll-box {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 46px;
    width: 100%;
    padding: 0.5em 0;
    overflow: auto;
  }
  & h3 {
    margin: 0;
    padding: 0.5em 4%;
    font-weight: normal;
    font-size: 1.05em;
    color: #666;
  }
  & .buy-list {
    padding: 0 4%;
    background-color: #fff;
    border-top: 1px solid #e5e5e5;
    & .list-item {
      position: relative;
      display: flex;
      align-items: center;
      padding: 0.5em 0;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #eee;
        transform: scaleY(0.8);
      }
    }
  }
  & .list-img {
    width: 3.6em;
    height: 3.6em;
    flex-shrink: 0;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
  & .list-text {
    flex-grow: 1;
    padding: 0 0.3em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & .list-price {
    width: 6em;
    flex-shrink: 0;
    text-align: right;
  }
  & .list-num {
    width: 3em;
    flex-shrink: 0;
    text-align: right;
  }
  & .buylist-pay-bar {
    text-align: right;
    padding: 0.8em 4%;
    background-color: #fff;
    border-bottom: 1px solid #e5e5e5;
    color: #666;
    & strong {
      font-size: 1.2em;
      font-weight: normal;
    }
  }
  & .confirm-payment-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    line-height: 46px;
    text-align: center;
    background-color: #ffc702;
    font-weight: bold;
    &.disabled {
      background-color: #ccc;
    }
  }
  & .no-data {
    text-align: center;
    padding: 5em 0;
  }
  & .red-font{
    color: red;
  }
  & .old-price{
    margin-left: 0.4em;
    text-decoration: line-through;
    font-size: 1em;
    color: #999;
  }
  & .discounts-coupon-area{
    margin: 1em 0;
    padding: 0 0 1em 0;
    background-color: #fff;
  }
  & .discounts-row{
    margin: 0.5em 4%;
    padding: 1em 0;
    border-bottom: 1px solid #ddd;
    color: #666;
    & .red-font{
      font-size: 1.2em;
    }
  }
  & .coupon-list{
    width: 94%;
    margin: 0 auto;
  }
  & .coupon-item{
    position: relative;
    padding: 0 10px;
    margin: 0 0 1em 0;
    &.active .coupon-item-inner::after{
      content:'';
      position: absolute;
      top: 50%;
      right: 1em;
      width: 1.2em;
      height: 1.2em;
      background-color: rgba(255,255,255,0.8);
      transform: translate3d(0,-50%,0);
      border-radius: 100%;
    }
    &::before{
      content :'';
      position: absolute;
      top: 0;
      left: 0;
      width: 1em;
      height: 100%;
      background: #ffc702;
      background: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 4px, #ffc702 4px);
      background-size: 15px 15px;
      background-position: 9px 3px;
    }
    &::after{
      content :'';
      position: absolute;
      top: 0;
      right: 0;
      width: 1em;
      height: 100%;
      background: #ffc702;
      background: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 4px, #ffc702 4px);
      background-size: 15px 15px;
      background-position: 9px 3px;
    }
    & .coupon-item-inner{
      position: relative;
      background-color: #ffc702;
      padding: 0.2em 1.4em;
      line-height: 1.2em;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &::after{
        content:'';
        position: absolute;
        top: 0;
        right: 24%;
        width: 1px;
        height: 100%;
        background-color: rgba(255,255,255,0.3);

      }
    }
    & h3{
      margin: 0;
      font-weight: bold;
      color: #fff;
    }
  }
  & .actual-payment-bar{
    margin: 1em 0;
    padding: 1em 4%;
    text-align: right;
    font-size: 1.1em;
    background-color: #fff;
  }
}
</style>
