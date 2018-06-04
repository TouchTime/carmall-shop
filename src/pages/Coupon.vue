<template>
  <div class="coupon-page">
    <div v-if="couponList.length > 0" class="coupon-list">
      <div v-for="(item,index) in couponList" :key="item.id" class="coupon-item">
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
    <div v-else class="no-data">
      <p>您还有没获得任何优惠券</p>
    </div>
  </div>
</template>
<script>
import {
  WARequest,
  sessionStorage,
  storage,
  loginInfo
} from '../util.js';
import moment from 'moment';
moment.locale('zh-CN');

export default {
  data(){
    return {
      shopID : '',
      couponList : []
    }
  },
  created(){
    let listed = loginInfo();
		this.userID = listed ? listed.user.id : '2000000001';
    this.queryCouponList(this.userID);
  },
  methods:{
    queryCouponList(uid){
      WARequest({
				url :`/promotions/discount/user/${uid}`,
				method : 'GET',
				data : {},
				done : (res)=>{
          this.couponList = res.data;
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
    formatTime(date){
      return moment(date).format("YYYY/MM/DD")
    }
  }
}
</script>
<style>
.coupon-page{
  padding: 1em 0;
  overflow: auto;
  background-color: #fff;
  & .coupon-list{
    width: 94%;
    margin: 0 auto;
  }
  & .coupon-item{
    position: relative;
    padding: 0 10px;
    margin: 0 0 1em 0;
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
      padding: 0.6em 1.4em;
      line-height: 1.6em;
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
      margin: 0.2em 0;
    }
  }
  & .no-data{
    padding: 2em 0;
    text-align: center;
    font-size: 1.1em;
    color: #999;
  }
}
</style>
