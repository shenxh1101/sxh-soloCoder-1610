export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/orders/index',
    'pages/repair/index',
    'pages/mine/index',
    'pages/order-detail/index',
    'pages/rating/index',
    'pages/statistics/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTitleText: '物业报修',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/orders/index',
        text: '工单'
      },
      {
        pagePath: 'pages/repair/index',
        text: '报修'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
