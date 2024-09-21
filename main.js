import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import VueLazyload from 'vue-lazyload';
Vue.use(VueLazyload, {
    preLoad: 5.3,  
    attempt: 3,
    // 设置懒加载时的占位图
    loading: '/static/tabbar/home.png',
    // 设置图片加载失败时的占位图
    error: '/static/tabbar/home.png'
});
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif
// #ifdef VUE3
import {
    createSSRApp
} from 'vue'
import onfire from '@/common/onfire.js'
// 公共组件
import headerBar from './components/header.vue'
/*底部数据*/
import tabBar from "@/components/tabbar/footTabbar.vue"
/* 配置 */
import config from "./env/config.js";
import {
    gotopage
} from '@/common/gotopage.js'
import requestFun from '@/utils/request.js';
import validator from '@/utils/validator.js';
import store from "./store/index.js"
//#ifdef H5
import jweixin from 'weixin-js-sdk';
//#endif
export function createApp () {
    const app = createSSRApp(App)

    app.component("header-bar", headerBar)
    app.component("tabBar", tabBar)

    app.use(store)

    app.config.globalProperties.$store = store;
    app.config.globalProperties.footTabberData = {
        active: 'home'
    }
    // #ifdef APP-PLUS
		//plus.navigator.closeSplashscreen();
	// #endif
    app.config.globalProperties.$fire = new onfire()
    app.config.globalProperties.config = config
    app.config.globalProperties.websiteUrl = config.app_url;
    app.config.globalProperties.appId = config.appId || uni.getStorageSync('appId') || 10001;
    //h5发布路径
    app.config.globalProperties.h5_addr = config.h5_addr;
    // #ifdef H5
    app.config.globalProperties.configWx = function (signPackage, shareParams, params) {
        if (signPackage == null) {
            return;
        }
        console.log('--------------------');
        console.log(signPackage);
        let self = this;
        jweixin.config({
            debug: false,
            appId: signPackage.appId, // 必填，公众号的唯一标识
            timestamp: "" + signPackage.timestamp, // 必填，生成签名的时间戳
            nonceStr: signPackage.nonceStr, // 必填，生成签名的随机串
            signature: signPackage.signature, //必填，签名，见附录1
            jsApiList: [
                'updateAppMessageShareData',
                'updateTimelineShareData'
            ],
            openTagList: ['wx-open-subscribe'],
        });

        let url_params = self.getShareUrlParams(params);

        jweixin.ready(function (res) {
            jweixin.updateAppMessageShareData({
                title: shareParams.title,
                desc: shareParams.desc,
                link: self.websiteUrl + self.h5_addr + shareParams.link + '?' + url_params,
                imgUrl: shareParams.imgUrl,
                success: function () {

                }
            });
            jweixin.updateTimelineShareData({
                title: shareParams.title,
                desc: shareParams.desc,
                link: self.websiteUrl + self.h5_addr + shareParams.link + '?' + url_params,
                imgUrl: shareParams.imgUrl,
                success: function () {

                }
            });
        });
    };

    app.config.globalProperties.configWxScan = function (signPackage) {
        if (signPackage == '') {
            return;
        }
        jweixin.config(JSON.parse(signPackage));
        return jweixin;
    };
    // #endif
    /*页面跳转*/
    app.config.globalProperties.gotoPage = gotopage;
    app.config.globalProperties.font_url = config.font_url;

    app.config.globalProperties.points_name = function (e) {
        if (!e) {
            return store.state.points_name;
        } else {
            let re = new RegExp("积分", "g");
            return e.replace(re, store.state.points_name);
        }
    }
    //#ifdef H5
    // app.$router.afterEach((to, from) => {
    // 	const u = navigator.userAgent.toLowerCase()
    // 	if (u.indexOf("like mac os x") < 0 || u.match(/MicroMessenger/i) != 'micromessenger') return
    // 	if (to.path !== global.location.pathname) {
    // 		location.assign(config.h5_addr + to.fullPath);
    // 	}
    // })
    //#endif

    //请求
    requestFun(app);

    validator(app);

    app.config.globalProperties.theme = function () {
        return 'theme' + this.$store.state.theme || ''
    }
    app.config.globalProperties.callPhone = function (phone) {
        uni.makePhoneCall({
            phoneNumber: phone //仅为示例
        });
    }
    app.config.globalProperties.openmap = function (latitude, longitude) {
        uni.openLocation({
            longitude: Number(longitude),
            latitude: Number(latitude),
        })
    }
    app.config.globalProperties.footTab = function () {
        return this.$store.state.footTab || ''
    }

    app.config.globalProperties.getTabBarLinks = function () {
		this._get(
		            'user/message/getUnreadAllCount',
		                {
		                    
		                },
		                (res)=>{
		        console.log(res);
		        if(res.code==1){
		            // self.newsNum = res.data;
		            //this.$store.commit('getNewsTotal', res.data);
					
					if(res.data>0){
						uni.showTabBarRedDot({
							index: 2
						})
					}else{
						uni.hideTabBarRedDot({
							index: 2
						})
                    }
					
		        }
		        }
		    )
            this._get('order/cart/count', {}, function (res) {
				
				if (res.data > 0) {
					uni.setTabBarBadge({
						index: 3,
                        color:'#BE1E1E',
						 text: `${res.data}`
				})

				} else if (res.data == 0) {
					uni.removeTabBarBadge({ index: 3 });//移除条数

				}
				self.loadding = false;
			});
            // self._get(
			// 		'settings/appShare',{},
			// 		function(res) {
			// 			console.log(res);
			// 			self.shareConfig = res.data;
			// 		}
			// 	);
        // uni.hideTabBar();
        // uni.request({
        //     url: this.config.app_url + '/api/front/index/nav',
        //     data: {
        //         appId: this.config.appId
        //     },
        //     success: (res) => {
        //         let theme = res.data.data.theme.theme;
        //         let nav = res.data.data.nav;
        //         this.$store.commit('changeTheme', theme);
        //         this._get(
        //             'user/message/getUnreadAllCount',
        //                 {
                            
        //                 },
        //                 (res)=>{
        //         console.log(res);
        //         if(res.code==1){
        //             // self.newsNum = res.data;
        //             this.$store.commit('getNewsTotal', res.data);
        //         }
        //         }
        //     )
        //         // 
        //         uni.setStorageSync('TabBar', nav);
        //         if (nav.isAuto == 0) {
        //             uni.showTabBar();
        //             nav.list = [];
        //             let color = ['#ff5704', '#19ad57', '#ffcc00', '#1774ff', '#e4e4e4', '#c8ba97',
        //                 '#623ceb', '#ff5704'
        //             ]
        //             uni.setTabBarStyle({
        //                 color: '#333333',
        //                 selectedColor: color[theme],
        //             })
        //             uni.setTabBarItem({
        //                 index: 0,
        //                 pagePath: '/pages/index/index',
        //                 text: '首页',
        //                 iconPath: '/static/tabbar/home.png',
        //                 selectedIconPath: '/static/tabbar/home_' + theme + '.png',
        //             })

        //             setTimeout(() => {
        //                 uni.setTabBarItem({
        //                     index: 1,
        //                     pagePath: '/pages/cart/cart',
        //                     text: '购物车',
        //                     iconPath: '/static/tabbar/cart.png',
        //                     selectedIconPath: '/static/tabbar/cart_' + theme + '.png',
        //                 })
        //             }, 5000);

        //             uni.setTabBarItem({
        //                 index: 2,
        //                 pagePath: '/pages/product/category',
        //                 text: '邀请好友',
        //                 iconPath: '/static/tabbar/category.png',
        //                 selectedIconPath: '/static/tabbar/category_' + theme + '.png',
        //             })


        //             uni.setTabBarItem({
        //                 index: 3,
        //                 pagePath: '/pages/user/index/index',
        //                 text: '我的',
        //                 iconPath: '/static/tabbar/user.png',
        //                 selectedIconPath: '/static/tabbar/user_' + theme + '.png',
        //             })

        //             console.log('-----show main--------');
        //             uni.setStorageSync('theme', theme);
        //         } else {
        //             console.log('-----hide--------')
        //             uni.hideTabBar();
        //         }
        //     }
        // });
    }

    app.config.globalProperties.getThemeColor = function () {
        let theme = this.$store.state.theme;
        let color = ['#ff5704', '#19ad57', '#ffcc00', '#1774ff', '#e4e4e4', '#c8ba97', '#623ceb'];
        return color[theme]
    }
    app.config.globalProperties.getTimeData = function (timestamp) {
        if (typeof timestamp === 'string') {
            timestamp = Number(timestamp);
        }
        if (typeof timestamp !== 'number') {
            alert("输入参数无法识别为时间戳");
        }
        let date = new Date(timestamp);
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = date.getDate() + ' ';
        let h = date.getHours() + ':';
        let m = date.getMinutes() + ':';
        let s = date.getSeconds();
        return Y + M + D + h + m + s;
    }

    app.config.globalProperties.footTab = function () {
        return this.$store.state.footTab || ''
    }

    /* 小数点截取 */
    app.config.globalProperties.subPrice = function (str, val) {
        let strs = String(str);
        if (val == 1) {
            return strs.substring(0, strs.indexOf("."));
        } else if (val == 2) {
            let indof = strs.indexOf(".");
            return strs.slice(indof + 1, indof + 3);
        }
    }

    /* 测试通用邮箱 */
    app.config.globalProperties.testEmail = function (str) {
        let reg = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return reg.test(str);
    }
    if (process.env.NODE_ENV == 'production') {
      console.log = () => {}//开发环境去除看一下效果
    }

    return {
        app,
    }
}
// #endif