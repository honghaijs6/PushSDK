'use strict';

const MODE = 'employees';

const { Service }  = require('feathers-nedb'); // TÊN { Service } này mặc định ko đổi khi extend class
const mModel = require('../../models/'+MODE+'.model');
const Helper = require('../../hooks/ultil/helper') ;

const createRandTimeCode = require('../../hooks/ultil/createRandTimeCode') ;



class Controller extends Service{


    constructor(options){
        super(options);

        this.Model = options.Model;

        this._schema = {
          sn:'',
          user:{},
          createdAt:0,
          updatedAt:0
        }

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

    /* CUSTOMER GET CALL API */


    _hasDuplicates(arr) {
        var counts = [];

        for (var i = 0; i <= arr.length; i++) {
            if (counts[arr[i]] === undefined) {
                counts[arr[i]] = 1;
            } else {
                return true;
            }
        }
        return false;
    }

     async _testCreateCode(prefix,params){

      let codes = [];

      for(let i=0; i<1000; i++){
        const myCode = await createRandTimeCode(prefix) ;
        codes.push(myCode) ;

      }

      if(!this._hasDuplicates(codes)){
         return codes
      }else{ return 'duplicated'}



    }

    /*
    sync database data to devices data
    */
    _callSyncDevice(sn,params){

      return new Promise((resolve, reject)=>{

        // LOAD ALL EMPS
        this.Model.find({ sn:sn},  (err, docs)=> {


          let cmd = "";
          let retValue = "ok";

          if(docs.length > 0){

            docs.map((item)=>{

              cmd += "CardNo="+item['CardNo']+"\t"+
              "Pin="+item['Pin']+'\t'+
              "Password="+item['Password']+'\t'+
              "Group="+item['Group']+'\t'+
              "StartTime="+item['StartTime']+'\t'+
              "EndTime="+item['EndTime']+'\t'+
              "Name="+item['Name']+'\t'+
              "SuperAuthorize="+item['SuperAuthorize']+'\t'+
              "Disable="+item['Disable']+'\r\n'+

              "";


            });

            cmd = "DATA UPDATE user "+cmd;
          }

          const moCommand = this.app.service("commands") ;
          moCommand.Model.insert({sn:sn, cmd:cmd},(err)=>{

            // ADD COMMAND USER AUTHORIZE
            if(err===null){

                let cmdAuth = "";
                docs.map((item)=>{
                  cmdAuth += "Pin="+item['Pin']+"\tAuthorizeTimezoneId=1\tAuthorizeDoorId=15\r\n" ;

                });

                //"DATA UPDATE userauthorize pin=1000\tauthorizetimezoneid=1\tauthorizedoorid=1
                cmdAuth = "DATA UPDATE userauthorize "+cmdAuth;

                moCommand.Model.insert({sn:sn,cmd:cmdAuth},(err2)=>{
                  resolve( err2 === null ? retValue : err2 );

                });

            }


          })


        });
      });



      //return 'ok sync' ;

    }

    async _test(id,params){

      return id;
    }

    async create(data,params){


      const data_out = params.data ;

      return new Promise((resolve,reject)=>{


          Object.assign(this._schema,data);
          this.Model.insert(this._schema,(err,newDoc)=>{

                data_out.data = newDoc ;
                data_out.err = err ;

                resolve(data_out);

            });
      });

    }


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
