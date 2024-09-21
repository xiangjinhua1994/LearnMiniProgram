<script>
import utils from './common/utils.js';
import config from './env/config.js';
// #ifdef H5
import vconsole from 'vconsole';
import proConfig from './env/production.js';
// #endif
export default {
	globalData: {
		statusBarHeight: '', // 状态栏高度
		capsuleHeight: '', // 胶囊高度
		capsuleWidth: '', // 胶囊宽度
		platform: '', // 平台
		navTotalHeight: '', // 导航栏总高度
		// #ifdef H5
		$vconsole: null,
		// #endif
	},
	onLaunch: function (e) {
		// 检查options.query或options.path中是否有你需要的URL参数  
		if (e.path && e.path.startsWith('nanheshop://')) {  
			// 解析URL，获取页面路径和参数  
			let path = e.path.replace('nanheshop://', '');  
			// 根据path跳转到指定页面  
			uni.navigateTo({  
				url:'/'+ path  
			});  
		} 
		// uni.hideTabBar();
    // let topBarTop = 0
    // let topBarBottom = 0
    // // #ifdef MP-WEIXIN
    // topBarTop = uni.getMenuButtonBoundingClientRect().top
    // topBarBottom = uni.getMenuButtonBoundingClientRect().height
    // // #endif
    // // #ifndef MP-WEIXIN
    // const SystemInfo = uni.getSystemInfoSync()
    // topBarTop = SystemInfo.statusBarHeight // 状态栏高度。
    // topBarBottom = 0
    // // #endif
    // const topBar = {
    //   top: topBarTop,
    //   bottom: topBarBottom,
    //   height: topBarTop + topBarBottom
    // }
    // uni.topBar = topBar
    // console.log("object", uni.topBar)
		// #ifdef H5
		if (proConfig.url === proConfig.useVcEnv && proConfig.useVcEnv !== "https://app-dev.yiweiyi.cn" ) {
			if (!this.$vconsole) {
				this.$vconsole = new vconsole();
			}else{ // 先带上打印
				//this.$vconsole = new vconsole();
			}
		}


		
		this.$router.afterEach((to, from) => {
			const u = navigator.userAgent.toLowerCase();
			if (
				u.indexOf('like mac os x') < 0 ||
				u.match(/MicroMessenger/i) != 'micromessenger'
			)
				return;
			if (to.path !== location.pathname) {
				location.assign(config.h5_addr + to.fullPath);
			}
		});
		// #endif
		// #ifdef APP-PLUS
		// plus.navigator.closeSplashscreen();
		//this.gotoPage('/pages/index/start');
		 setTimeout(() => {
			plus.navigator.closeSplashscreen();

		// 	this.gotoPage('/pages/index/index')
		}, 2000);
		this.isFirstEnter();
		// #endif
		// console.log('App Launch');
		//#ifdef MP-WEIXIN
		//检查更新
		this.updateManager();
		//#endif
		let self = this;
		// #ifdef APP-PLUS
		// plus.runtime.getProperty(plus.runtime.appid, function (widgetInfo) {
		// 	uni.request({
		// 		url: config.app_url + '/api/front/index/update',
		// 		data: {
		// 			version: widgetInfo.version,
		// 			appId: config.appId,
		// 			platform: uni.getSystemInfoSync().platform,
		// 		},
		// 		success: (result) => {
		// 			var data = result.data.data;
		// 			if (data.update && data.wgtUrl) {
		// 				self.updateWgt(data.wgtUrl);
		// 			}
		// 			if (data.update && data.pkgUrl) {
		// 				plus.nativeUI.confirm(
		// 					'有新版本更新，请点击确认更新到最新版本，以免影响使用',
		// 					function (e) {
		// 						if (e.index == 0) {
		// 							plus.runtime.openURL(data.pkgUrl);
		// 						}
		// 					},
		// 					{
		// 						title: '更新提示',
		// 						buttons: ['确定', '取消'],
		// 						verticalAlign: 'center',
		// 					}
		// 				);
		// 			}
		// 		},
		// 		error: (error) => {
		// 			console.log('----------------error');
		// 			console.log(error);
		// 		},
		// 	});
		// });
		// #endif
		//应用启动参数
		this.onStartupScene(e.query);
		// #ifndef APP-PLUS
		//#endif
		this.getTabBarLinks();

		//获取状态栏高度
		this.initStatusBarHeight();
	},
	beforeCreate() {},
	onShow: function (e) {
		// 检查options.query或options.path中是否有你需要的URL参数  
		// if (e.path && e.path.startsWith('nanheshop://')) {  
		// 	// 解析URL，获取页面路径和参数  
		// 	let path = e.path.replace('nanheshop://', '');  
		// 	// 根据path跳转到指定页面  
		// 	uni.navigateTo({  
		// 		url:'/'+ path  
		// 	});  
		// } 
		 // #ifdef APP-PLUS
		 let type = uni.getStorageSync('type');
		//  if(type=='h5'){
			let args = plus.runtime.arguments;
			let url = args.split('//')[1];
			console.log('url8888', url);
			
		 if( url.indexOf("type=h5") >0){
			plus.runtime.arguments = '';
			uni.navigateTo({
				url: '/' + url
			})
		 }
			
		//  }
         // #endif

		// console.log('App Show')
		// this.$store.dispatch('GlobalInitQuery', { _vue: this });
	},
	onHide: function () {
		//console.log('App Hide')
	},
	methods: {
		initStatusBarHeight() {
			// #ifdef H5
			this.H5();
			this.globalData.platform = 'H5';
			// #endif

			//#ifdef MP-WEIXIN
			this.unaipp();
			this.globalData.platform = 'MP-WEIXIN';
			// #endif
		},
		H5() {
			// 获取手机状态栏高度-H5默认值44
			this.globalData.capsuleHeight = 44;
			// 计算导航栏总高度
			this.globalData.navTotalHeight = this.globalData.capsuleHeight;
		},
		unaipp() {
			// 获取手机状态栏高度
			this.globalData.statusBarHeight =
				uni.getSystemInfoSync()['statusBarHeight'];
			console.log(this.globalData.statusBarHeight, 'this.statusBarHeight....');
			// 获取胶囊信息
			const res = wx.getMenuButtonBoundingClientRect();
			//获取屏幕宽度
			const screenWidth = uni.getSystemInfoSync().screenWidth;
			// 计算胶囊高度
			this.globalData.capsuleHeight =
				res.height + 2 * (res.top - this.globalData.statusBarHeight);
			// 计算胶囊宽度
			this.globalData.capsuleWidth = screenWidth - res.left;
			console.log(this.globalData.capsuleWidth, 'this.capsuleWidth....');
			// 计算导航栏总高度
			this.globalData.navTotalHeight =
				this.globalData.statusBarHeight + this.globalData.capsuleHeight;
		},
		isFirstEnter() {
			var firstEnter = uni.getStorageSync('firstEnter'); //同步获取缓存中是否有首次进入字段
			let self = this;
			uni.getSystemInfo({
				success(data) {
					console.log('firstEnter=' + firstEnter);
					// 如果是ios并且没有firstEnter缓存则弹出模态框
					if (data.platform == 'ios' && !firstEnter) {
						console.log('---------------');
						uni.navigateTo({
							url: '/pages/privacy/privacy',
						});
					}
				},
			});
		},
		updateManager: function () {
			const updateManager = uni.getUpdateManager();
			updateManager.onCheckForUpdate(function (res) {
				// 请求完新版本信息的回调
				if (res.hasUpdate) {
					updateManager.onUpdateReady(function (res2) {
						uni.showModal({
							title: '更新提示',
							content: '新版本已经准备好，即将重启应用',
							showCancel: false,
							success(res2) {
								if (res2.confirm) {
									// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
									updateManager.applyUpdate();
								}
							},
						});
					});
				}
			});

			updateManager.onUpdateFailed(function (res) {
				// 新的版本下载失败
				uni.showModal({
					title: '更新提示',
					content: '检查到有新版本，但下载失败，请检查网络设置',
					showCancel: false,
				});
			});
		},
		/**
		 * 小程序启动场景
		 */
		onStartupScene(query) {
			// console.log(query, '小程序启动携带参数---------------');

			// 获取场景值
			let scene = utils.getSceneData(query);
			// 记录推荐人id
			let refereeId = query.refereeId;
			if (refereeId > 0) {
				if (!uni.getStorageSync('refereeId')) {
					uni.setStorageSync('refereeId', refereeId);
				}
			}
			// 记录分销人id
			let uid = scene.uid;
			// console.log(uid, 'uid-------');
			if (uid > 0) {
				uni.setStorageSync('refereeId', uid);
			}
			// 邀请有礼id
			let invitationId = query.invitationId;
			if (invitationId > 0) {
				uni.setStorageSync('invitationId', invitationId);
			}
			let invitid = scene.invitid;
			if (invitid > 0) {
				uni.setStorageSync('invitationId', invitid);
			}
			// 如果是h5，设置appId
			// #ifdef  H5
			let appId = query.appId;
			if (appId > 0) {
				uni.setStorageSync('appId', appId);
			}
			if (uni.getStorageSync('appId')) {
				this.config.appId = uni.getStorageSync('appId');
			}
			// #endif
		},
		// mpState 1 开启公总号微信授权 0不开启公总号微信授权
		getWxopen() {
			let self = this;
			uni.request({
				url: this.config.app_url + '/api/front/index/loginSetting',
				data: {
					appId: this.config.appId,
				},
				success: (result) => {
					uni.setStorageSync('mpState', result.data.data.mpState);
					uni.setStorageSync('wxOpen', result.data.data.wxOpen);
					uni.setStorageSync('wxBinding', result.data.data.wxBinding);
				},
			});
		},
		getTabBarLinks() {
			// this.getWxopen();
			// uni.request({
			// 	url: this.config.app_url + '/api/front/index/nav',
			// 	data: {
			// 		appId: this.config.appId,
			// 	},
			// 	success: (res) => {
			// 		let nav = res.data.data.nav;
			// 		let theme = res.data.data.theme.theme;
			// 		this.$store.commit('changeTheme', theme);
			// 		uni.setStorageSync('TabBar', nav);
			// 		if (nav.isAuto == 0) {
			// 			uni.showTabBar();
			// 			nav.list = [];
			// 			let color = [
			// 				'#ff5704',
			// 				'#19ad57',
			// 				'#ffcc00',
			// 				'#1774ff',
			// 				'#e4e4e4',
			// 				'#c8ba97',
			// 				'#623ceb',
			// 			];
			// 			uni.setTabBarStyle({
			// 				color: '#333333',
			// 				selectedColor: color[theme],
			// 			});
			// 			uni.setTabBarItem({
			// 				index: 0,
			// 				text: '首页',
			// 				iconPath: '/static/tabbar/home.png',
			// 				selectedIconPath: '/static/tabbar/home_' + theme + '.png',
			// 			});

			// 			uni.setTabBarItem({
			// 				index: 1,
			// 				text: '购物车',
			// 				iconPath: '/static/tabbar/cart.png',
			// 				selectedIconPath: '/static/tabbar/cart_' + theme + '.png',
			// 			});

			// 			uni.setTabBarItem({
			// 				index: 2,
			// 				text: '邀请好友',
			// 				iconPath: '/static/tabbar/category.png',
			// 				selectedIconPath: '/static/tabbar/category_' + theme + '.png',
			// 			});

			// 			uni.setTabBarItem({
			// 				index: 3,
			// 				text: '我的',
			// 				iconPath: '/static/tabbar/user.png',
			// 				selectedIconPath: '/static/tabbar/user_' + theme + '.png',
			// 			});
			// 			uni.setStorageSync('theme', theme);
			// 		} else {
			// 			// console.log('-----hide--------');
			// 			// uni.hideTabBar();
			// 		}
			// 	},
			// });
		},
		updateWgt(wgtUrl) {
			uni.showModal({
				title: '版本更新',
				content: '检查到有新版本，请点击更新',
				confirmText: '更新',
				showCancel: false,
				success: function (e) {
					if (e.confirm) {
						var dtask = plus.downloader.createDownload(
							wgtUrl,
							{},
							function (d, status) {
								uni.showToast({
									title: '下载完成',
									mask: false,
									duration: 1000,
								});
								// 下载完成
								if (status == 200) {
									plus.runtime.install(
										d.filename,
										{
											force: true,
										},
										function () {
											console.log('install success...');
											plus.nativeUI.alert(
												'已更新至最新版本，确定后将重启应用',
												function () {
													plus.runtime.restart();
												},
												'更新提示',
												'确定'
											);
										},
										function (e) {
											console.log(e);
											console.log(d.filename);
											uni.showToast({
												title: '安装失败-01',
												mask: false,
												duration: 1500,
											});
										}
									);
								} else {
									uni.showToast({
										title: '更新失败-02',
										mask: false,
										duration: 1500,
									});
								}
							}
						);
						try {
							dtask.start(); // 开启下载的任务
							var prg = 0;
							var showLoading = plus.nativeUI.showWaiting('正在下载'); //创建一个showWaiting对象
							dtask.addEventListener('statechanged', function (task, status) {
								// 给下载任务设置一个监听 并根据状态  做操作
								switch (task.state) {
									case 1:
										showLoading.setTitle('正在下载');
										break;
									case 2:
										showLoading.setTitle('已连接到服务器');
										break;
									case 3:
										prg = parseInt(
											(parseFloat(task.downloadedSize) /
												parseFloat(task.totalSize)) *
												100
										);
										showLoading.setTitle('  正在下载' + prg + '%  ');
										break;
									case 4:
										plus.nativeUI.closeWaiting();
										//下载完成
										break;
								}
							});
						} catch (err) {
							plus.nativeUI.closeWaiting();
							uni.showToast({
								title: '更新失败-03',
								mask: false,
								duration: 1500,
							});
						}
					} else {
						//取消
					}
				},
			});
		},
	},
};
</script>

<style lang="scss">
@import './common/iconfont.css';
@import './common/myIcon.css';
/*每个页面公共css */
@import './common/style.scss';
//新添加的配置样式
@import './common/myStyle.scss';
@import './common/reset.scss';
page {
	background: #f6f6f6;
	font-size: 0.75rem;
	min-height: 100vh;
}

.uni-checkbox-input {
	border-radius: 80rpx !important;
}


.uni-tabbar__reddot {
	
	background-color: #f43530 !important;
}
</style>

