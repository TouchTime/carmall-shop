<template>
<div :class="{'page':true,'order-page':true,'loading':isLoading}">
  <ul v-if="orderList.length > 0" class="order-list">
    <li class="order-item" v-for='(item,i) in orderList'>
      <div class="order-title">
        <span>历史订单编号：{{item.orderCode}}</span>
      </div>
      <div class="order-goods-list">
        <div class="ogl-inner">
          <div v-for='(list,index) in item.orderList' class="ogl-item" :style="'background-image:url('+list.productUrl+')'"></div>
        </div>
      </div>
      <div class="order-footer">
        <div class="of-left">
          <span>时间：</span>
          <span>{{formatTime(item.createTime)}}</span>
        </div>
        <div class="of-right">
          <span>订单金额：</span>
          <span style="color:#ffc700"><small>¥ </small>{{(item.paySum).toFixed(2)}}</span>
        </div>
      </div>
    </li>
  </ul>
  <div v-else class="no-data">
    <p class="no-data-text">您未购买过任何商品！</p>
    <div class="go-back" @click="goBack">再去看看</div>
  </div>
</div>
</template>
<script>
import {
  WARequest,
  loginInfo,
  storage
} from '../util.js'

import moment from 'moment';

moment.locale('zh-CN');

export default {
  data() {
    return {
      orderList: [],
      userID:'',
      isLoading: false
    }
  },
  created() {
    let listed = loginInfo();
    this.userID = listed ? listed.user.id : '';
    this.getOrderList();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    getOrderList() {
      this.isLoading = true;
      WARequest({
        url: `/orders/order/getorderunionpage`,
        data: {
          type: 2,
          userId: this.userID,
          status: 2
        },
        done:(res)=>{
          this.orderList = res.data.result;
          this.isLoading = false;
        },
        fail:(err)=>{
          console.warn(err);
          if(err.responseJSON){
            if (err.responseJSON.error_mesg) {
              alert(err.responseJSON.error_mesg);
            } else if (err.responseJSON.error) {
              alert(err.responseJSON.error);
            }
          }else{
            alert('获取历史订单列表失败！');
          }
        }
      });
    },
    formatTime(date){
      return moment(date).format("YYYY/MM/DD HH:mm:ss")
    }
  }
}
</script>

<style>
.order-page {
  background-color: #f8f8f8;
  overflow-y: auto;
  &.loading::after{
    content: '数据加载中...';
    position:absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 999;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & .order-list li {
    background-color: #fff;
    margin: 1em 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    & .order-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6em 4%;
      background-color: #fff;
    }
    & .order-goods-list{
      padding: 0.2em 4%;
      border-top: 1px solid #f8f8f8;
      border-bottom: 1px solid #f8f8f8;
      overflow-x: auto;
      overflow-y: hidden;
    }
    & .ogl-inner{
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      & .ogl-item{
        position: relative;
        flex-shrink: 0;
        width: 4.5em;
        height: 4em;
        background-size: 90%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 4em;
        &::after{
          content:'';
          position: absolute;
          right: 0;
          top: 10%;
          width: 1px;
          height: 80%;
          background-color: #f6f6f6;
          transform: scaleX(0.8);
        }
        &:last-child::after{
          display: none;
        }
      }
    }
    & .order-footer{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6em 4%;
      & .of-left{
        font-size: 95%;
        color: #999;
      }
    }
  }
  & .no-data{
    padding: 5em 0;
    text-align: center;
    & .no-data-text{
      font-size: 1.2em;
    }
    & .go-back{
      width: 90%;
      margin: 4em auto;
      border-radius: 1.4em;
      line-height: 2.8em;
      background-color: #ffc702;
    }
  }
}
</style>
