<template>
<div class="pay-success">
  <div class="pay-s-content">
    <div class="pay-s-icon"></div>
    <h2>支付成功！</h2>
    <div class="pay-success-bar">
      <div class="pay-s-again" @click="goHome">再来一单</div>
      <!-- <div class="pay-s-fx" @click="isShowMask = true">分享好友</div> -->
    </div>
  </div>
  <transition name="fade">
    <div v-if="isShowMask" class="mask-layer" ref="shareMask" @click="isShowMask = false">
      <img :src="shareArrows" alt="" />
    </div>
  </transition>
</div>
</template>
<script>
import { sessionStorage } from '../util.js';
import shareArrows from '../assets/share-arrows.png';
export default {
  data() {
    return {
      shareArrows,
      isShowMask: false
    }
  },
  mounted(){
    //清空购物车
    sessionStorage.delete('cartList');
  },
  methods: {
    goHome() {
      //清空购物车
      sessionStorage.delete('cartList');
      this.$router.replace({
        name: 'home',
        query: {
          timestamp: (new Date()).getTime()
        }
      });
    }
  }
}
</script>
<style>
.mask-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 100;
  &>img {
    position: absolute;
    top: 0.5em;
    right: 1em;
    width: 6em;
  }
}

.pay-success {
  width: 100%;
  background-color: #fff;
}

.pay-s-content {
  width: 90%;
  padding-top: 3em;
  height: 100%;
  margin: 0 auto;
  text-align: center;
}

.pay-success-bar {
  margin: 3em 0;
}

.pay-s-icon {
  width: 5em;
  height: 5em;
  margin: 0 auto;
  background: url('../assets/success.png') no-repeat 50% 50% / 100%;
}

.pay-s-fx,
.pay-s-again {
  width: 80%;
  text-align: center;
  line-height: 2.6em;
  border-radius: 1.3em;
  color: #fff;
  margin: 1em auto;
  background: #ffc700;
}

.fade-enter-active {
  animation: fadeIn 0.2s;
}

.fade-leave-active {
  animation: fadeIn 0.2s reverse;
}
</style>
