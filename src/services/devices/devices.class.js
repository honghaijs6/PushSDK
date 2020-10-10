'use strict';

const MODE = 'devices';

const { Service }  = require('feathers-nedb'); // TÊN { Service } này mặc định ko đổi khi extend class
const mModel = require('../../models/'+MODE+'.model');
const Helper = require('../../hooks/ultil/helper') ;
const myTime = require('../../hooks/ultil/myTime');

const randCode = require('../../hooks/ultil/createRandTimeCode');
const calculateTime = require('../../hooks/ultil/calculateTime');


class Controller extends Service{


    constructor(options){
        super(options);

        this.Model = options.Model;

        this._schema = {
          cmd:'',
          sn:'',
          user:{},
          createdAt:0,
          updatedAt:0
        };

        this.data = [] ;
    }

    setup(app){
      this.app = app ;
    }

    async find(params){

      const query = params.query;

      const schema = params.schema;


      let data_out = {
        name:'success',
        count:0,
        rows:[]
      };

      let condition = schema.where.$and;

      return new Promise((resolve,reject)=>{

        // WITH SEARCH KEY
        if(schema.where.$and.json!==undefined){

          let key = schema.where.$and.json.$like ;
          key = key.trim();
          key = new RegExp(key, "i");

          condition = {json:key} ;


          const sort_by  = schema.order[0][0];
          const sort_type = schema.order[0][1];





          this.Model.find(condition).sort({ [sort_by]: [sort_type] }).skip(schema.offset).limit(schema.limit).exec( (err, docs)=> {

            let key = schema.where.$and.json.$like ;
            key = key.trim();
            key = new RegExp(key, "i");

            condition = {json:key}

            this.Model.count(condition,(err,count)=>{
              data_out.rows = docs;
              data_out.count = count;
              resolve(data_out);

            })

          });


        }else{

          // NONE SEARCH

          console.log('NONE SREACG=========')
          this.Model.count(condition,(err,count)=>{

             const sort_by  = schema.order[0][0];
             const sort_type = schema.order[0][1];

             this.Model.find(condition).sort({ [sort_by]: [sort_type] }).skip(schema.offset).limit(schema.limit).exec(function (err, docs) {

              data_out.count = count ;
              data_out.rows = docs;
              resolve(data_out);

            });

          })


        }


      })



    }

    /* THIS ROUTE :
      method : GET
      http://base/{service}/{id} => get item info
      http://base/{service}/{method}/params => call controller  function
    */
    async get(id,params){

        let ret = {
            name:"error",
            message:"",
          };
          const { query, route } = params ;
          if(JSON.stringify(route)==="{}"){
            ret.message = "Vui lòng kiểm tra thông số .. "+id ;
          }else{
            ret = route ;
            ret = await this['_'+route.method](id,params);  //this.Model[route.method](id,params) ;

          }


         return ret

    }

    _hasDuplicates(arr) {
      var counts = [];

      for (var i = 0; i <= arr.length; i++) {
          if (counts[arr[i]] === undefined) {
              counts[arr[i]] = 1;
          } else {
              console.log(arr[i]);
              return true;
          }
      }
      return false;
    }

    _await(duration){
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve(true);
        },duration)
      })
    }

    async _napcode(num,params){

       let listCode = [] ;
       for(let i=0; i<num; i++){

          const codes = await this._generateCode(10);
          listCode = [...listCode,...codes];

          //await this._await(500);

       }

       if(!this._hasDuplicates(listCode)){

          listCode.map((item)=>{
            this.data.push(item);
          });

       }

       return this._hasDuplicates(this.data);
    }

    async _generateCode(total, params){

      let testCode = [];
      for(var i=0; i< total; i++){
         const code =  await randCode("1110") ;
         testCode.push(code)

      }

      return this._hasDuplicates(testCode) ? this._generateCode(total,params) : testCode   ;

    }

    _insertListLiveCode(arr=[]){

      return new Promise((resolve,reject)=>{
        const moLiveCode = this.app.service('live-code').Model ;

        moLiveCode.insert(arr,(err)=>{

          resolve(err);

        });

      });





    }


    /* INIT DATA FOR TEST ONLY
      1. DEL ALL USER * DEVICE
      2. DEL ALL USERAUTHORIZE * DEVICE
      3. DEL ALL LIVE CODE
      4. NAP LAI DATA CHO THIET BI
      5. NAP LIVE CODE

    */
    async _initData(sn='',params){

      let retValue = {
        name:'error'
      }

      if(sn.length > 6){
        const moCommand = this.app.service('commands').Model;
        const moLiveCode = this.app.service('live-code').Model;

        // 1. DEL ALL USER
        let cmdDelUser = 'DATA DELETE user *';
        await moCommand.add(sn,cmdDelUser);

        // 2. DEL ALL USERAUTHORIZ
        let cmdDelUserAuth = 'DATA DELETE userauthorize *';
        await moCommand.add(sn,cmdDelUserAuth);

        // 3 DEL ALL LIVE CODE
        await moLiveCode.remove({},{multi:true});

        // 4 NAP DATA
        const listCode = await this._generateCode(100);

        if(!this._hasDuplicates(listCode)){
           // REPARE FOR PUSH DEVICE
           if(listCode.length > 0){

            let cmd = '' ;
            listCode.map((item)=>{

              cmd += "CardNo="+item+"\t"+
              "Pin="+item+'\t'+
              "Password="+""+'\t'+
              "Group="+"0"+'\t'+
              "StartTime="+"0"+'\t'+
              "EndTime="+"0"+'\t'+
              "Name="+""+'\t'+
              "SuperAuthorize="+"0"+'\t'+
              "Disable="+"0"+'\r\n'+
              "";


            });

            cmd = "DATA UPDATE user "+cmd;
            await moCommand.add(sn,cmd);

            // UPDATE AUTHORIZE
            let cmdAuth = "";
            listCode.map((item)=>{
              cmdAuth += "Pin="+item+"\tAuthorizeTimezoneId=1\tAuthorizeDoorId=15\r\n" ;

            });

            cmdAuth = "DATA UPDATE userauthorize "+cmdAuth;
            await moCommand.add(sn,cmdAuth);

            // 5. NAP LIVE-CODE
            let listLiveCode = [];
            listCode.map((item)=>{

              const code = {
                "gate_no":"11",
                "type_no":"10",
                "pin":item,
                "cardno":item,
                "sn":sn,
                "type":"qrcode",
                "createdAt":myTime.unixTime()
              }

              listLiveCode.push(code);

            });

            await this._insertListLiveCode(listLiveCode) ;




          }
        }else{
          retValue.msg = "duplicated codes"
        }

        retValue.name = 'success';


      }else{
        retValue.msg = "Vui lòng truyền số serial"
      }

      return retValue;

    }

    async _test(id,params){

      return id;
    }



    /* METHOD POST
    route :/devices/SetTimeZone
    data = { sn:serial no}
    */
    async _postSetTimeZone(data,params){

      return new Promise((resolve, reject)=>{

        const retValue = {
          name:"err"
        };


        const  cmd = "DATA UPDATE timezone timezoneid=1"+
  				"\tSunTime1="+calculateTime("00:00","23:59")+
  				"\tSunTime2="+calculateTime("00:00", "00:00")+
  				"\tSunTime3="+calculateTime("00:00","00:00")+

  				"\tMonTime1="+calculateTime("00:00","23:59")+
  				"\tMonTime2="+calculateTime("00:00", "00:00")+
  				"\tMonTime3="+calculateTime("00:00", "00:00")+

  				"\tTueTime1="+calculateTime("00:00","23:59")+
  				"\tTueTime2="+calculateTime("00:00", "00:00")+
  				"\tTueTime3="+calculateTime("00:00", "00:00")+

  				"\tWedTime1="+calculateTime("00:00","23:59")+
  				"\tWedTime2="+calculateTime("00:00", "00:00")+
  				"\tWedTime3="+calculateTime("00:00", "00:00")+

  				"\tThuTime1="+calculateTime("00:00","23:59")+
  				"\tThuTime2="+calculateTime("00:00", "00:00")+
  				"\tThuTime3="+calculateTime("00:00", "00:00")+

  				"\tFriTime1="+calculateTime("00:00","23:59")+
  				"\tFriTime2="+calculateTime("00:00", "00:00")+
  				"\tFriTime3="+calculateTime("00:00", "00:00")+

  				"\tSatTime1="+calculateTime("00:00","23:59")+
  				"\tSatTime2="+calculateTime("00:00", "00:00")+
  				"\tSatTime3="+calculateTime("00:00", "00:00")+

  				"\tHol1Time1="+calculateTime("00:00","23:59")+
  				"\tHol1Time2="+calculateTime("00:00", "00:00")+
  				"\tHol1Time3="+calculateTime("00:00", "00:00")+

  				"\tHol2Time1="+calculateTime("00:00","23:59")+
  				"\tHol2Time2="+calculateTime("00:00", "00:00")+
  				"\tHol2Time3="+calculateTime("00:00", "00:00")+

  				"\tHol3Time1="+calculateTime("00:00","23:59")+
  				"\tHol3Time2="+calculateTime("00:00", "00:00")+
  				"\tHol3Time3="+calculateTime("00:00", "00:00")+
  				"\r\n";

          if(data.sn){
             const moCommand = this.app.service('commands').Model;
             moCommand.add(data.sn, cmd).then((res)=>{

                resolve({
                  name:'success',
                  data:res
                });

             })
          }else{
            resolve(retValue);
          }


      })
    }

    /* BOOTRAP POST METHOD CREATE FUNCTION */
    async create(data,params){

      const { route } = params ;

      if(JSON.stringify(route)==='{}'){

        const data_out = params.data ;
        return new Promise((resolve,reject)=>{


            Object.assign(this._schema,data);
            this.Model.insert(this._schema,(err,newDoc)=>{

                  data_out.data = newDoc ;
                  data_out.err = err ;

                  resolve(data_out);

              });
        });

      }else{
        // CALL CUSTOM FUNCTION
        const { method } = route ;
        return  await this['_post'+method](data,params);

      }



    }

    /* END METHOD POST */


    // DÙNG PATCH KO DÙNG PUT : NÓ VÁ THÊM THÔNG TIN KO LÀM MẤT THÔNG TIN
    async patch(id, data, params) {

      //const { condition } = params.data ;
      //const mNews = this.app.service('news');
      let data_out = params.data;

      /*const fullcontent = data.content;
      data.shortContent = Helper.subArr(data.content,20);
      delete data.content;*/


      const result = await super.patch(id,data,params);

      /*if(result){
        // UPDATE NEWS HERE
        data.content = fullcontent;
        delete data.shortContent ;
        mNews.patch(id,data,params)
        // END NEWS
      }*/

      Object.assign(data_out.data,result);
      return data_out;


    }

    async remove(id, params) {

      let data_out = {
        name:'success',
        message:'',
        data:{}
      }

      let retValue ;

      if(id==='all'){
        //const result = await super.remove(id,params);

        retValue = await this.Model.remove({},{ multi:true});


      }else{

        retValue = await super.remove(id,params);


      }




      Object.assign(data_out.data,retValue);
      return data_out ;

    }


}

module.exports = function(app){

    const Model = mModel(app);

    const paginate = app.get('paginate');
    return new Controller({Model,paginate});

};

module.exports.Service = Controller;
