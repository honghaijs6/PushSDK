
/*const { Service } = require('feathers-sequelize');

exports.Tickets = class Tickets extends Service {

};*/


/*
DEPARTMENTS
cURL
		GET
      - /           method find(params)  : custom
      - /{id}       method get(id,params): custom
    POST
      - /authentication           method authenticate() : default
      - /                         method create() : custom
    PUT

    DEL
*/

const mode = 'tickets';

const { Service } = require( 'feathers-sequelize');
const mModel = require('../../models/'+mode+'.model');
const Helper = require('../../models/helper');

class iRoute extends Service {


    constructor(options) {


      Object.assign(options,{
        events:['logs']
      });

      super(options);



    }

    setup(app){
      this.app = app;
    }

    /* GET DATA INFO || CALL METHOD WITH GET HTTP REST*/
    async get(id,params){
        //const data = await this.Model.getInfo(id);

        let ret = {
          name:"error",
          message:"",
        };
        const { query, route } = params ;
        if(JSON.stringify(route)==="{}"){
          ret.message = "Vui lòng kiểm tra thông số .. "
        }else{
          ret = route ;

          ret = await this.Model[route.method](id,params) ;

        }

        return ret


    }
    /* METHOD CRUD */
    async find(params){

      /* GOT HOOKED BEFOR : => Default schema from app main Object*/
      const schema = params.schema ;

      let data = await this.Model.findAndCountAll(schema);

      Object.assign(data,{
        name: 'success',
        //userInfo:params.userInfo
      });

      return  data ;

    }


    /* cURL POST */
    async create(data,params){

        /* cleart all fields null  */
        const data_out = params.data ; // BE HOOKED BEFORE

        if(data_out.name==="success"){


          //if(data.device_serial === undefined){
            //data.code =  data.card_type === 0 ?  await this.Model._createCode() : data.code ;
          //  data_out.data = data_out.name==='success' ?  await this.Model.create(data) : data_out.data ;

          //}else{
            // INSERT DATABASE AND DEVICE TOO
            //const isSuccess = await pushapi.pushCode(data.code,data.device_serial, data.starttime,data.endtime);
            //if(isSuccess){
            data_out.data = data_out.name==='success' ?  await this.Model.create(data) : data_out.data ;
            //}

          //}

          // PUSH DATA TO DEVICE
          const moCommand = this.app.service("commands") ;
          const moCmdLogs = this.app.service('command_logs');

          let cmd = "CardNo="+data['cardno']+"\t"+
              "Pin="+data['pin']+'\t'+
              "Password="+data['password'] || '' +'\t'+
              "Group="+data['group'] || 0 +'\t'+
              "StartTime="+data['starttime'] || '0' +'\t'+
              "EndTime="+data['endtime'] || '0' +'\t'+
              "Name="+data['name'] || 'no-name'+'\t'+
              "SuperAuthorize="+data['superauthorize'] || 0 +'\t'+
              "Disable="+data['disable'] || 0 +'\r\n'+

              "";

          cmd = "DATA UPDATE user "+cmd;


          moCmdLogs.Model.count({},(err,count)=>{
              let indexCMD = count + 100 ;

              moCommand.Model.insert({sn:data.sn, cmd:cmd, _index:indexCMD },(err)=>{
                if(err===null){

                    indexCMD +=1 ;
                   // UPDATE AUTHORIZE
                    let cmdAuth = "";

                    cmdAuth += "Pin="+data['pin']+"\tAuthorizeTimezoneId=1\tAuthorizeDoorId=15\r\n" ;
                    cmdAuth = "DATA UPDATE userauthorize "+cmdAuth;

                    moCommand.Model.insert({sn:data.sn,cmd:cmdAuth, _index:indexCMD},(err2)=>{

                      console.log(err2);
                      //resolve( err2 === null ? retValue : err2 );

                    });

                }
              });



          });








        }

        return data_out;


    }



    async update(id,data,params){

      /* be hooked before : to get condition schema for update database from params query*/
      let ret = {};


      if(params.isMethod){

         ret =  this[params.data.method](data,params);

      }else{

        ret = params.data ;

        // AFTER FOLLOW HOOKED FIRST
        if(ret.name==='success'){

          const {condition} = ret;
          const isSuccess = await this.Model.update(data,condition);
          ret.name = parseInt(isSuccess[0]) > 0 ? 'success' : 'fail-update' ;

          const info =  await this.Model.getInfo(data.id) ;

          ret.data = info ;

        }

      }

       return ret ;

    }
    /* cURL : DELETE */
    async remove(id, params ){

      /* be hooked before => data for update*/
      /*let idata = params.data ;

      const isSuccess = await this.Model.destroy({
        where:{
          id:id
        }
      });

      idata.name = parseInt(isSuccess) > 0 ? 'success' : 'fail-remove';*/
      let idata = {
        name:'error',
        message:'',
        data:{}
      }

      const isSuccess = await super.remove(id,params);
      if(isSuccess){
          idata.name = 'success';
          Object.assign(idata.data,isSuccess) ;
      }

      return idata;
    }

    /* CUSTOM METHOD ON UPDATE HTTP*/
    async test(data,params){





    }



  }

  /* options : app - hook - event */
  module.exports = function (options) {
    const app = options.app;
    const Model = mModel(app);
    const paginate = app.get('paginate');


    const sequelize = {
        Model,
        paginate
    }


    return new iRoute(sequelize);

  };

  module.exports.Service = iRoute;

