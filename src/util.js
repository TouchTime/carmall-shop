//接口路径map
const pathMap = {
  wechat: 'wxlogin',
  alipay: 'alipaylogin'
};

//千位分隔符
const formatMoney = (amount) => {
  if (amount) {
    let source = amount.toString().split(".");
    source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
    source[1] = source[1] || '00';
    if (source[1].length < 2) {
      source[1] = source[1] + '0';
    } else if (source[1].length > 2) {
      source[1] = source[1].substring(0, 2);
    }
    return source.join(".");
  } else {
    return '0.00';
  }
};

//获取url参数
const gqs = (name) => {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  let r = window.location.search.substr(1).match(reg);
  if (r != null)
    return unescape(r[2]);
  return null;
};

//包裹 window.localStorage
const storage = {
  get(key) {
    return JSON.parse(window.localStorage.getItem(key));
  },
  set(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  delete(key) {
    window.localStorage.removeItem(key)
  },
  clear() {
    window.localStorage.clear()
  }
};

//包裹window.sessionStorage
const sessionStorage={
  get(key) {
    return JSON.parse(window.sessionStorage.getItem(key));
  },
  set(key, value) {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },
  delete(key) {
    window.sessionStorage.removeItem(key)
  },
  clear() {
    window.sessionStorage.clear()
  }
}

//提示，并重新授权
const reAuthorization = ()=>{
  if (window.confirm("登录失败，请重试！")) {
    storage.clear();
    window.location.href = `${window.host}/auth/${{'wechat':'weixin','alipay':'alipay'}[window.env]}?state=${gqs('state')}`;
  }
};

//登录接口
const userLogin = (code, cb) => {
  let path = pathMap[window.env];
  if (path) {
    $.ajax({
      url: `${window.host}/social/token`,
      method: 'POST',
      dataType: 'JSON',
      data: {
        code
      }
    }).done((res) => {
      let originalInfo = res;
      //添加时间，方便提前刷新
      originalInfo.token.datetime = (new Date()).getTime();
      storage.set('loginInfo', originalInfo); //保存登录信息（token，user）
      cb && cb(res);
    }).fail((err) => {
      console.log(err);
      if(!storage.get('loginInfo')){
        reAuthorization();
      }else{
        cb && cb();
      }
    })
  }else{
    console.warn('浏览器环境无法使用！');
  }
};

/**
 * 通过url的state参数确定用户具体访问的页面
 */
const identityChecks = (cb) => {
  if(gqs('state')){
    const state = gqs('state').split('YYBB');
    state[1] ? sessionStorage.set('shopID', state[1]) : sessionStorage.delete('shopID');
    if (state[0] == 'driver') {
      window.location.href = `/driver/index.html?state=${gqs('state')}`;
    } else if (state[0] == 'store') {
      window.location.href = `/store/index.html?state=${gqs('state')}`;
    }else{
      cb && cb(state[1]);
    }
  }else{
    alert('参数state，不存在！');
  }
};

/**
* 刷新Token
*/
const refreshToken = (cb)=>{
  if(storage.get('loginInfo')){
    const {token,user} = storage.get('loginInfo');
    const diffTime = (new Date()).getTime() - token.datetime;
    if(diffTime > 3600){
      $.ajax({
        url:'${window.host}/oauth/token',
        method: 'POST',
        dataType: 'JSON',
        headers : {
          Authorization : 'Basic eXVuYmFvOnl1bmJhb3NlY3JldA=='
        },
        data: {
          'grant_type' : token['refresh_token']
        }
      }).done((res)=>{
        let originalToken = res;
        let oldLoginInfo = storage.get('loginInfo');
        originalToken.datetime = (new Date()).getTime();
        oldLoginInfo.token = originalToken;
        storage.set('loginInfo', oldLoginInfo); //更新登录信息（token，user）
        cb && cb(originalToken);
      }).fail((err)=>{
        //reAuthorization();
      });
    }else{
      cb && cb(token);
    }
  }else{
    //reAuthorization();
  }
};

/**
 * obj          [Object]   请求所有参数
 * obj.url      [String]   请求地址
 * obj.method   [String]   请求方法
 * obj.dataType [String]   请求数据格式
 * obj.done     [Function] 请求成功回调
 * obj.fail     [Function] 请求失败回调
 */
const WARequest = (obj) => {
  const token= storage.get('loginInfo') ? storage.get('loginInfo')['token']  : '';
  $.ajax({
    url: window.host + obj.url,
    method: obj.method || 'GET',
    headers: {
      Authorization: token ? `Bearer ${token.access_token}` : ''
    },
    dataType: obj.dataType || 'json',
    data: obj.data || {}
  }).done((res) => {
    obj.done && obj.done(res);
  }).fail((err) => {
    obj.fail && obj.fail(err);
  });
}

//微信JSSDK初始化
const initWechatApi = () => {
  if (window.env == 'wechat') {
    WARequest({
      url: '/social/signKey',
      method: 'POST',
      data: {
        url: window.location.href.split('#')[0]
      },
      done: (res) => {
        wx.config({
          debug: false,
          appId: res.appid || 'wxdc04684b964f7dda',
          timestamp: res.timestamp,
          nonceStr: res.noncestr,
          signature: res.signature,
          jsApiList: [
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'onMenuShareQZone',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'scanQRCode',
            'closeWindow',
            'chooseWXPay'
          ]
        });
        wx.error(function(res){
          console.log(res);
        });
      },
      fail: (err) => {
        console.log(err);
      }
    })
  } else {
    console.warn('无法使用微信JSSDk');
  }
}

/**
 * 扫码
 * cb [Function]  扫码完成回调函数，参数为扫码结果
 */
const scanQR = (cb) => {
  if (window.env == 'wechat') {
    wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: [
        "qrCode", "barCode"
      ], // 可以指定扫二维码还是一维码，默认二者都有
      success: (res) => {
        cb && cb(res.resultStr);
      }
    });
  } else if (window.env == 'alipay') {
    // type: 'bar' 一维码 'qr' 二维码
    ap.scan({
      type: 'qr'
    }, (res) => {
      cb && cb(res.code);
    });
  } else {
    alert('请使用微信或支付宝扫码！');
  }
};

/**
 * 图片预览
 * obj.current [String]  当前图片路径
 * obj.urls    [Array]   图片路径列表
 */
const previewImage = (obj) => {
  if (obj) {
    let {
      current,
      urls
    } = obj;
    if (window.env == 'wechat') {
      wx.previewImage({
        current,
        urls
      });
    } else if (window.env == 'alipay') {
      ap.previewImage({
        current: urls.indexOf(current),
        urls
      });
    } else {
      console.warn('请在微信或支付环境中使用！', obj);
    }
  } else {
    console.warn('请正确传入参数！');
  }
};

/**
 * 分享
 * opt       [Object]    分享配置信息
 * opt.title [String]    分享标题
 * opt.desc  [String]    分享描述
 * opt.link  [String]    分享页面链接
 * opt.imgUrl[String]    分享图片链接
 * instantly [Boolean]   是否立即执行 （支付宝使用）
 * cb        [Function]  分享完成回调，支付宝回调有参数
 */
const share = (opt,instantly,cb) => {
  let opts = Object.assign({}, {
    title: '车猫随手购',
    desc: '贩卖零食',
    link: `${window.host}/auth/${{wechat:'weixin',alipay:'alipay'}[window.env]}?state=YYBB1`,
    imgUrl: ''
  }, opt);
  if (window.env == 'wechat') {
    wx.ready(()=>{
      //分享朋友圈
      wx.onMenuShareTimeline({
        title: opts.title,
        link: opts.link,
        imgUrl: opts.imgUrl,
        success: () => {
          cb && cb()
        },
        cancel: () => {}
      });
      //分享给朋友
      wx.onMenuShareAppMessage({
        title: opts.title,
        desc: opts.desc,
        link: opts.link,
        imgUrl: opts.imgUrl,
        success: () => {
          cb && cb()
        },
        cancel: () => {}
      });
      //分享到QQ
      wx.onMenuShareQQ({
        title: opts.title,
        desc: opts.desc,
        link: opts.link,
        imgUrl: opts.imgUrl,
        success: () => {
          cb && cb()
        },
        cancel: () => {}
      });
    });
  } else if (window.env == 'alipay' && instantly) {
    ap.share({
      title: opts.title,
      content: opts.desc,
      url: opts.link,
      image: opts.imgUrl
    }, (result) => {
      cb && cb(result);
    });
  } else {
    console.warn('请在微信或支付环境中使用！', opts, cb);
  }
};

/**
 * 支付
 * obj          [Object]   支付所需的参数和回调
 * obj.package  [Sring]    微信支付-订单详情扩展字符串
 * obj.signType [String]   微信支付-签名方式
 * obj.paySign  [String]   微信支付-签名
 * obj.tradeNO  [String]   支付宝支付-交易号
 * obj.done     [Function] 支付成功回调函数
 * obj.fail     [Function] 支付失败回调函数
 */
const Pay = (obj) => {
  (typeof WeixinJSBridge == "undefined") ?
  document.addEventListener('WeixinJSBridgeReady', initReady, false): initReady();
  window.AlipayJSBridge ?
    initReady() :
    document.addEventListener('AlipayJSBridgeReady', initReady, false);

  function initReady() {
    if (window.env == 'wechat') {
      WeixinJSBridge.invoke('getBrandWCPayRequest', {
        appId: obj.appId,
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.paySign
      }, function(res) {
        if (res.err_msg == "get_brand_wcpay_request:ok") {
          obj.done && obj.done(res);
        } else if (res.err_msg == "get_brand_wcpay_request:fail") {
          obj.fail && obj.fail(res);
        } else {
          obj.fail && obj.fail(res);
        }
      });
    } else if (window.env == 'alipay') {
      AlipayJSBridge.call("tradePay", {
        tradeNO: obj.tradeNO
      }, function(result) {
        if ("9000" == result.resultCode) {
          obj.done && obj.done(result);
        }else if(['8000','6004'].indexOf(result.resultCode) != -1){
          obj.fail && obj.fail(result);
        }else{
          obj.fail && obj.fail(result);
        }
      });
    } else {
      console.warn('请在微信或支付环境中使用！');
    }
  }
};

/**
 * 从location.storage 中的获取loginInfo
 * loginInfo.token
 * loginInfo.user
 */
const loginInfo = () => storage.get('loginInfo') || '';

export {
  userLogin,
  WARequest,
  storage,
  sessionStorage,
  gqs,
  initWechatApi,
  scanQR,
  previewImage,
  share,
  Pay,
  identityChecks,
  formatMoney,
  loginInfo,
  reAuthorization
}
