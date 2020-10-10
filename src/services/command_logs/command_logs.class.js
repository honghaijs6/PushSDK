'use strict';

const MODE = 'command_logs';

const { Service }  = require('feathers-nedb'); // TÊN { Service } này mặc định ko đổi khi extend class

const mModel = require('../../models/'+MODE+'.model');
const Helper = require('../../hooks/ultil/helper') ;


class Controller extends Service{


    constructor(options){



        Object.assign(options,{
          events:['logs']
        });

        super(options);


        this.Model = options.Model;

        this._schema = {
          sn:'',
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
