<template>
    <div class="mongolian" v-if="popShow">
        <div class="layer">
            <img :src="close" alt="close-img" class="popClose"  @click="closeBanner">
            <a :href="popUp.imgUrl">
                <img :src="popUp.imgPic" alt="banner" class="popBanner">
            </a>
            
        </div>
    </div>
    
</template>
<script>
import close from '../assets/close.png';
import cubilose from '../assets/cubilose.png';
import { WARequest,loginInfo,storage} from '../util.js';
export default {
    data(){
        return{
            close,
            cubilose,
            popShow:false,
            popUp:{
                imgUrl:'',
                imgPic:''
            }
        }
    },
    created() {
         
         this.queryBannerList();
    },
     methods:{
        closeBanner(){
           this.popShow = false;
        },
        queryBannerList(){
        WARequest({
            url : `/systems/systemFile/findFile`,
            data : {type:255},
            done : (res)=>{
                if(res.data.result[0].filePath){
                    this.popShow = true;
                    this.popUp = Object.assign({},{imgPic:res.data.result[0].filePath,imgUrl:res.data.result[0].fileUrl});
                }else{
                     this.popShow = false;
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
                    alert('获取海报图失败！');
                }
            }
        })
    },
  },
   
}
</script>
<style>
.mongolian{
    width: 100vw;
    height: 100vh;
    background:rgba(0, 0, 0, 0.5);
    z-index: 1111;
    position:relative;
    left:0;
    top:0;
}
.popClose{
    display:inline-block;
    width:1.8em;
    height:1.8em;
    float:right;
    margin-right:3.6em;
}
.popBanner{
    display:inline-block;
    width:24.2em;
    /* height: 26em; */
    position:absolute;
    left:50%;
    top:3.2em;
    transform: translate(-50%,0);
    -webkit-transform: translate(-50%,0);
    -o-transform: translate(-50%,0);
    -oz-transform: translate(-50%,0);
}
.layer{
    width: 100%;
    position:absolute;
    left:50%;
    top:3.21em;
    transform: translate(-50%,0);
}
/* .layer{
    position:absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    height: 33rem;
    -webkit-transform: translate(-50%,-50%);
} */
</style>
