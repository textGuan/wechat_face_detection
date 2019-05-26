//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    images:[],
    gender: '',
    age: '',
    emotion: '',
    scrore: '',
    expression: '',
    glasses: '',
    faceend:true,
    animation:false
  },
  face_image:function(){
    wx.chooseImage({
      count:1,
      sizeType:['original','compressed'],
      sourceType:['album','camere'],
      success: (res)=> {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          images:tempFilePaths,
          animation:true 
        })
        setTimeout(()=>{
          wx.uploadFile({
            url: 'http://www.thexxdd.cn/baidu/',
            filePath: tempFilePaths[0],
            name: 'file',
            success: (res) => { 
              var data = res.data
              var datas = JSON.parse(data)
              var faceing = datas.faces
              if (faceing.message == '没有检测到人脸') {
                this.setData({
                  faceend: false,
                  animation: false
                })
              } else {
                this.setData({
                  animation: false,
                  faceend: true,
                  gender: faceing.gender,
                  age: faceing.age,
                  emotion: faceing.emotion,
                  scrore: faceing.scrore,
                  expression: faceing.expression,
                  glasses: faceing.glasses
                })
              }
            }
          })
        },4000)
      }
    })
  }
  
})
