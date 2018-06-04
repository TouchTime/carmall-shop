<template>
	<div class='app-banner-wrap'>
		<swiper v-if="banners.length > 0" :options="swiperOption" ref="mySwiper">
			<swiper-slide v-for="(item,index) in banners" :key="index">
				<div class="item-img" @click="handleClick(item.fileUrl)" :style="`background-image:url(${item.filePath});`"></div>
			</swiper-slide>
			<div class="swiper-pagination" slot="pagination"></div>
		</swiper>
	</div>
</template>
<script>
import 'swiper/dist/css/swiper.css';
import banner1 from '../assets/banner-1.png';
import banner2 from '../assets/banner-2.png';
import banner3 from '../assets/banner-3.png';
import banner4 from '../assets/banner-4.jpg';
import {swiper,swiperSlide} from 'vue-awesome-swiper';
import {WARequest,loginInfo} from '../util.js';

export default {
	name: 'carrousel',
	components: {
		swiper,
		swiperSlide,
	},
	data() {
		return {
			banners : [],
			swiperOption: {
				loop: false,
				autoplay: true,
				pagination: {
					el: '.swiper-pagination'
        }
			}
		}
	},
	mounted(){
		this.queryBannerList();
	},
	methods: {
		queryBannerList(){
			WARequest({
				url : `/systems/systemFile/findFile`,
				data : {type:4},
				done : (res)=>{
					this.banners = res.data.result;
				},
				fail : (err)=>{
					if(err.responseJSON){
						if (err.responseJSON.error_mesg) {
							alert(err.responseJSON.error_mesg);
						} else if (err.responseJSON.error) {
							alert(err.responseJSON.error);
						}
					}else{
						alert('获取banner图失败！');
					}
				}
			})
		},
		handleClick(linkUrl){
			let listed = loginInfo();
			// if(linkUrl == '/showDiscount'){

			// 	if(listed.user.phone){
			// 		//红包bug修改
			// 		WARequest({
			// 		url : `/promotions/discount/promotion/80111213`,
			// 		method : 'GET',
			// 		data : {userId:listed.user.id},
			// 		done : (res)=>{
			// 			cb && cb(res.data);
			// 		},
			// 		fail : (err)=>{
			// 			if(err.responseJSON){
			// 				if (err.responseJSON.error_mesg) {
			// 					alert(err.responseJSON.error_mesg);
			// 				} else if (err.responseJSON.error) {
			// 					alert(err.responseJSON.error);
			// 				}
			// 			}
			// 		}
			// 	})
			// 		// alert('您已经参与过了！');
			// 	}else{
			// 		this.$emit('handleShow');
			// 	}
			if(linkUrl == '/exclusive'){
				// 专属活动-胡庆余堂
				this.$emit('handleExclusive');
			}else if(linkUrl && linkUrl.indexOf('http') != -1){
               window.location.href = linkUrl;
			}
		}
	},
	computed: {
		swiper() {
			return this.$refs.mySwiper.swiper
		}
	}
}
</script>
<style >
.app-banner-wrap,.swiper-container,.item-img{
	position: relative;
	height: 100%;
	width: 100%;
	margin: 0 auto;
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover;
}

.swiper-pagination-fraction, .swiper-pagination-custom, .swiper-container-horizontal > .swiper-pagination-bullets{
	bottom: 0 !important;
}
.swiper-pagination-bullet{
	width: 6px !important;
	height: 6px !important;
}
</style>
