<template>
  <div class="me-page">
    <div class="user-info">
      <div class="user-avatar-img" :style="'background-image:url('+userInfo.headImg+')'"></div>
      <p>{{userInfo.nickname}}</p>
    </div>
    <div class="me-nav">
      <div class="nav-item" @click="goOrders">
        <div class="nil">
          <i class="icon mi-1"></i>
          <span>我的订单</span>
        </div>
        <div class="nir">
          <i class="icon arrows"></i>
        </div>
      </div>
      <div class="nav-item" @click="goCoupon">
        <div class="nil">
          <i class="icon mi-2"></i>
          <span>我的优惠券</span>
        </div>
        <div class="nir">
          <i class="icon arrows"></i>
        </div>
      </div>
    </div>
    <div class="me-footer">车猫 · 随手购</div>
  </div>
</template>
<script>
import { loginInfo } from '../util.js';
import defaultAvatar from '../assets/user-avatar.png';
export default{
  data(){
    return {
      userInfo : {}
    }
  },
  created(){
    let listed = loginInfo();
    this.userInfo = listed ? listed.user : {headImg : defaultAvatar,nickname : '车猫'};
  },
  methods:{
    goOrders(){
      this.$router.push({
				name: 'myorders',
				query: {
					timestamp: (new Date()).getTime()
				}
			});
    },
    goCoupon(){
      this.$router.push({
				name: 'coupon',
				query: {
					timestamp: (new Date()).getTime()
				}
			});
    }
  }
}
</script>
<style>
.me-page{
  & .user-info{
    height: 130px;
    background-color: #ffc702;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    & .user-avatar-img{
      width: 5em;
      height: 5em;
      border-radius: 100%;
      background-color: #fff;
      box-shadow: 0  0 5px rgba(0,0,0,0.1);
      margin: 0 auto 0.5em auto;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }
  }
  & .me-nav{
    margin: 1em 0 0 0;
    background-color: #fff;
    box-shadow: 0  0 1px rgba(0,0,0,0.1);
  }
  & .nav-item{
    position: relative;
    padding: 1.1em 4%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &::after{
      content:'';
      position: absolute;
      bottom: 0;
      left: 4%;
      width: 92%;
      height: 1px;
      background-color: #eee;
      transform: scaleY(0.8);
    }
    &:last-child::after{
      display: none;
    }
    & i{
      width: 1.8em;
      height: 1.8em;
      margin: -3px 0.4em 0 0;
    }
    & .mi-1{
      background: url("../assets/mi-1.png") no-repeat 50% 50% / 100%;
    }
    & .mi-2{
      background: url("../assets/mi-2.png") no-repeat 50% 50% / 100%;
    }
    & .arrows{
      background: url('../assets/arrows.png') no-repeat 100% 50% / 70%;
    }
  }
  & .me-footer{
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 1em 0;
    color: #ccc;
  }
}

</style>
