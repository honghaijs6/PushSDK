
/*
cURL : http:base//service?field=2 [condition ]
THIS GUY  :
  - KIÊM TRA PARAMS.QUERY
  - tra về lõi nếu ko tồn tại
  - trã về schema condition dê update database

*/
module.exports = function (options = {}) {
  return async context => {

    let {params} = context;

    if(!params.isMethod){
      let { query } = context.params;

      const userInfo = params.user;
      let data_out ={}

      /* case update  */

      /* DETECT params query  */
      data_out.message = Object.keys(query).length > 0 ? '' : 'Vui lòng xem lại params query fields';
      data_out.name = data_out.message === '' ? 'success' : 'hook-error';
      data_out.data = context.data ;
      data_out.type = context.method;
      data_out.model = context.service.Model.name;
      data_out.token = context.params.headers.authorization ;
      
      if(data_out.name==='success'){
          Object.assign(data_out,{
            condition:{
              where:query
            }
          });

      }

      params.data = data_out;
    }



    return context;


  };
};
