
/*
MODEL : tickets
- GIỬ MÃ HIỆN HÀNH
- XOÁ BỎ KHI QUÉT THÀNH CÔNG
*/

const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const moment = require('moment');

const MODE = 'tickets' ;
module.exports = function (app) {


  const paginate  = app.get('paginate')
  const sequelizeClient = app.get('sequelizeClient');


  const model = sequelizeClient.define(MODE,{
      id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        unique:true
      },

      // TRẠNG THÁI SỬ DỤNG : 1 OK - 0 : MẤT HIỆU LỰC
      status:{
        type:DataTypes.STRING,
        defaultValue:1
      },

      // MÃ CỔNG
      gate_no:{
        type:DataTypes.STRING,
        defaultValue:null,
      },
      // loai ve : 10 : nguoi lon - 12 : tre em
      type_no:{
        type:DataTypes.STRING,
        defaultValue:null
      },

      // MÃ PIN tren thiết bị
      pin:{
        type:DataTypes.INTEGER,
        defaultValue:0
      },

      // MÃ CODE TREN THIẾT BỊ
      cardno:{
        type:DataTypes.STRING,
        defaultValue:null
      },

      sn:{
        type:DataTypes.STRING,
        defaultValue:null
      },

      date_created:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        get() {
            const dateText = this.getDataValue('date_created');
            return moment(dateText).format('YYYY-MM-DD HH:mm:ss');
        }
      },
      date_modified:Sequelize.DATE


  });

  // MỞ RỘNG
  const Model = Object.assign(model,{

    _name:MODE,

    _maxPage:paginate.max,
    _page:0,
    _key:'',
    _start:'',
    _end:'',

    sort_by:'date_created',
    sort_type:'DESC',

    retData :{
      name:'success',
      data:{},
      message:''
    },

    listAll(filter,params){

      return new Promise((resolve, reject)=>{

        const {query} = params;

        this._maxPage = query.max || this._maxPage;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';


        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;


        // QUERY THEO NGÀY : start={yyyy-mm-dd}&end={yyyy-mm-dd}
        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";

        // QUERY THEO MÃ CỔNG : &gate_no={}
        const selWithGateNo = query.gate_no !== undefined ? ` AND ${this._name}.gate_no = '${query.gate_no}' ` : ''

        // QUERY THEO LOẠI VÉ : &type_no={}
        const selWithTypeNo = query.type_no !== undefined ? ` AND ${this._name}.type_no='${query.type_no}' ` : '';

        // QUERY THEO TRANG  THÁI
        const selWithStatus = query.status !== undefined ? ` AND ${ this._name }.status=${query.status} ` : '';

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";


        let sql = ` SELECT  ${this._name}.* `;

        const arr_type_condition = {

          "count":`

              FROM ${this._name}
              WHERE ( ${this._name}.cardno LIKE '%${this._key}%' )
              ${selWithDate + selWithStatus + selWithGateNo + selWithTypeNo   }

          `,
          "all": `
                  FROM ${this._name}
                  WHERE ( ${this._name}.cardno LIKE '%${this._key}%' )

                  ${selWithDate + selWithStatus + selWithGateNo + selWithTypeNo   }

                  ORDER BY ${this._name}.${this.sort_by} ${this.sort_type}
                  ${limit}
                 `
        };


        sql += arr_type_condition[filter];
        const countSQL = ` SELECT COUNT(*) AS cnt ${ arr_type_condition['count'] } `;

        sequelizeClient.query(sql).spread((results, metadata) => {

          sequelizeClient.query(countSQL).spread((count)=>{
              const data = {
                name:'success',
                count:count[0]['cnt'],
                rows:results,
              }
            resolve(data)
          });
        });

      })
    },

    check(code=''){

      return new Promise((resolve,reject)=>{

        const query = ` SELECT *
                        from ${this._name}
                        WHERE ${this._name}.cardno = '${code}'
                      `;

        let retValue = {
          status:-1
        }
        sequelizeClient.query(query).spread((results, metadata) => {

          const data = results.length > 0 ? results[0] : {}

          if(JSON.stringify(data)==='{}'){
            // KIEM TRA LIVE CODE
            const moLiveCode = app.service('live-code').Model ;

            moLiveCode.findOne({ cardno:code},(err,doc)=>{

              retValue.status = doc === null ? -1 : 0  ;

              resolve(Object.assign(retValue,{
                data:doc
              }));


            });

          }else{

            const dateText = data.date_created;
            data.date_created =  moment(dateText).format('YYYY-MM-DD HH:mm:ss');
            

            resolve(Object.assign(retValue,{
              status:1,
              data:data
            })) ;

          }


        });



      });

    },

    getInfoByCode(code=''){

      return new Promise((resolve,reject)=>{

        const query = ` SELECT *
                        from ${this._name}
                        WHERE ${this._name}.cardno = '${code}'
                      `;
        sequelizeClient.query(query).spread((results, metadata) => {

          const data = results.length > 0 ? results[0] : {}
          resolve(data);

        });


      });

    },

    isExisted(cardno){

    }


  });

  return Model;
};
