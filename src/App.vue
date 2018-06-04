<template>
<div id="app">
  <transition :name="transitionName">
    <router-view class="child-view"></router-view>
  </transition>
  	<!-- 2018-5-17 Summer新增banner弹窗 -->
		<transition name="popUp">
       <tipBanner></tipBanner>
		</transition>
</div>
</template>
<script>
import TipBanner from '../src/components/TipBanner.vue';
export default {
  name: "app",
  components:{TipBanner},
  data() {
    return {
      transitionName: "slide-left",
     
    }
  },
 
  watch: {
    $route(to, from) {
      var inTime = to.query.timestamp || 0;
      var outTime = from.query.timestamp || 0;
      this.transitionName = Number(inTime) < Number(outTime) ? "slide-right" : "slide-left";
    }
  }
};
</script>
<style>
@import './assets/css/base.css';

#app{
  position: relative;
  height: 100%;
  @media screen and (min-width: 414px){
    font-size: 15px;
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes zoomIn {
  0%{
    opacity: 0;
    transform: scale(0.3);
  }
  100%{
    opacity: 1;
    transform: none;
  }
}
@keyframes buycalculator {
  0% {
    transform: translate3d(0, 100%, 0);
  }
  100% {
    transform: none;
  }
}

@keyframes stretch {
  0% {
    width: 0;
  }
  100% {
    width: 50%;
  }
}
</style>
