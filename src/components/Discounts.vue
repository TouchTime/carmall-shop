<template>
  <div class="mask discounts-ad">
    <div class="discounts-ad-box">
      <div class="redPacket-bg"><img :src="redPacket" alt=""/></div>
      <div class="redPacket-inner">
        <div v-if="stepIndex == 1" class="step-1">
          <div class="coupon-list">
            <div class="coupon-item">
              <h3>{{discountsInfo.promotionName}}</h3>
              <p>{{discountsInfo.promotionDesc}}</p>
            </div>
          </div>
          <form class="bind-mobile" v-on:submit.prevent="onSubmit">
            <div class="form-group">
              <label><input type="number" v-model="formData.phone" autocomplete="off" placeholder="手机号码" /></label>
            </div>
            <div class="form-group">
              <label><input type="text" v-model="formData.smsCode" autocomplete="off" placeholder="验证码" /></label>
              <button type="button" @click="getCode">{{codeBtnText}}</button>
            </div>
            <div class="form-group no-border">
              <input type="submit" name="submit" value="提 交"/>
            </div>
          </form>
        </div>
      </div>
      <div class="close-mask-btn" @click="$emit('closeMask')"></div>
    </div>
  </div>
</template>

<script>
const mobileReg = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/;
import redPacket from '../assets/redPacket.png';
import { WARequest,loginInfo,storage} from '../util.js';
export default{
  props:['bindphone','discountsInfo'],
  data(){
    return {
      redPacket,
      stepIndex : 1,
      codeBtnText:'获取验证码',
      formData : {
        sid: '',
        phone : '',
        smsCode: ''
      }
    }
  },
  methods :{
    stepNext(){
      // if(!this.bindphone.isBindPhone){
      //   this.stepIndex = 2;
      // }else{
      //   this.$emit('complete');
      // }
    },
    getCode(){
      let {phone} = this.formData;
      if (this.codeBtnText === '获取验证码') {
        if (!mobileReg.test(phone)) {
					alert('请输入正确的手机号码！');
				} else {
          this.countdown();
          WARequest({
						url : '/code/hash',
						data : {phone,type : 1},
						done : (res)=>{
							WARequest({
								url : '/code/sms',
								method : 'POST',
								data : {phone,type : 1,hashCode: res.hashCode},
								done : (res)=>{
									this.formData.sid = res.sid;
								},
								fail : (err)=>{
									console.warn(err);
								}
							})
						},
						fail : (err)=>{
							console.warn(err);
						}
					})
        }
      }
    },
    countdown() {
			let sec = 60;
			this.timer = setInterval(() => {
				if (sec >= 1) {
					sec--;
					this.codeBtnText = `${sec}s后重发`;
				} else {
					clearInterval(this.timer);
					this.codeBtnText = '获取验证码';
				}
			}, 1000);
		},
    onSubmit(){
      let {phone,smsCode,sid} = this.formData;
      let Info = loginInfo();
      if (!mobileReg.test(phone)) {
				alert('请输入正确的手机号码！');
			} else if (!smsCode) {
				alert('请输入验证码！');
			} else {
        WARequest({
					url: '/users/user/bind/phone',
					method: 'POST',
					data: {
						phone,
						smsCode,
						type : Info.user.type,
						id : Info.user.id,
						sid
					},
					done : (res)=>{
						let oldInfo = storage.get('loginInfo');
						oldInfo.user = res.data;
						storage.set('loginInfo',oldInfo);
            this.$emit('complete');
					},
					fail : (err)=>{
            if(err.responseJSON){
							if (err.responseJSON.error_mesg) {
								alert(err.responseJSON.error_mesg);
							} else if (err.responseJSON.error) {
								alert(err.responseJSON.error);
							}
              this.$emit('closeMask');
						}else{
              alert('领取优惠失败！');
              this.$emit('closeMask');
            }
					}
				});
      }
    }
  },
  destroyed() {
		clearInterval(this.timer);
	}
}
</script>

<style>
.discounts-ad{
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & .discounts-ad-box{
    position: relative;
    width: 78%;
    margin: 0 auto;
    padding: 2em 0 1em 0;
    box-sizing: border-box;
    border-radius: 0.3em;
    & .coupon-item{
      position: relative;
      padding: 0.4em 1em;
      overflow: hidden;
      text-align: center;
      font-size: 1.4em;
      color: #fff;
      & h3{
        margin: 0;
        color: #fcee50;
      }
    }
    & .redPacket-inner{
      position: absolute;
      top: 38%;
      left: 8%;
      width: 84%;
      box-sizing: border-box;
    }
    & .draw-btn{
      text-align: center;
      line-height: 2.6em;
      border-radius: 0.4em;
      margin:1.5em auto 0 auto;
      background-color: #ffc702;
      color: #fff;
    }
    & .form-group{
      display: flex;
      margin: 0.6em 0;
      border-radius: 0.3em;
      background-color: #fff;
      &.no-border{
        border: 0;
      }
      & label{
        flex-grow: 1;
      }
      & input{
        width: 100%;
        height: 2.6em;
        outline: none;
        border:0;
        padding: 0 1em;
        border-radius: 0.3em;
        box-sizing: border-box;
        &[type="submit"]{
          border: 1px solid #fcee50;
          background-color: #fcee50;
          color: #333;
        }
      }
      & button{
        width: 8em;
        height: 2.6em;
        flex-shrink: 0;
        outline: none;
        border:0;
        text-align: right;
        background-color: rgba(255,255,255,0);
        color: #666;
      }
    }
  }
  & .red-font{
    color: red;
  }
  & .close-mask-btn{
    position: absolute;
    top: 2.5em;
    right: 0.8em;
    width: 1.8em;
    height: 1.8em;
    margin-left: -1em;
    transform: rotate(45deg);
    border: 1px solid #fff;
    border-radius: 100%;
    opacity: 0.6;
    &::before{
      content: '';
      position: absolute;
      top: 50%;
      left: 10%;
      width: 80%;
      height: 1px;
      background-color: #fff;
    }
    &::after{
      content: '';
      position: absolute;
      top: 10%;
      left: 50%;
      width: 1px;
      height: 80%;
      background-color: #fff;
    }
  }
}

.swiper-pagination-bullet-active{
  background-color: rgba(255,255,255,0.8) !important;
}
</style>
