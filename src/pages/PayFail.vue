<template>
<div class="pay-fail">
  <div class="pay-f-content">
    <div class="pay-f-icon"></div>
    <h2>支付失败！</h2>
    <div class="pay-f-again" @click="goBack">请重试</div>
  </div>
</div>
</template>
<script>
import { sessionStorage } from '../util.js';
export default {
  data() {
    return {
    }
  },
  mounted(){
    //清空购物车
    sessionStorage.delete('cartList');
  },
  methods: {
    goBack() {
      sessionStorage.delete('cartList');
      this.$router.go(-1);
    }
  }
}
</script>
<style>
.pay-fail {
  width: 100%;
  background-color: #fff;
}

.pay-f-content {
  width: 90%;
  padding-top: 3em;
  height: 100%;
  margin: 0 auto;
  text-align: center;
}

.pay-f-again {
  width: 80%;
  margin: 0 auto;
  text-align: center;
  line-height: 2.6em;
  border-radius: 1.3em;
  color: #fff;
  background: #ffc700;
}

.pay-f-fx {
  width: 12em;
  padding: 0.2em 0;
  margin-top: 0.5em;
  color: #ffc700;
  display: inline-block;
  background-color: #fff;
  border-radius: 1em;
  border: 0.0625em solid #ffc700;
}

@media (min-width:768px) {
  .pay-fail {
    background-color: #333;
  }
  .pay-f-content {
    width: 80%;
    background-color: #fff;
  }
  .pay-f-icon {
    width: 6em;
    height: 6em;
  }
  .pay-f-again,
  .pay-f-fx {
    width: 15em;
    padding: 0.4em 0;
  }
}
</style>
