/*
THIS GUY DETECT :
  - KIÊM TRA METHOD PUT là  ACTION KHÁC VỚI ID !=NULL & !== NUMBVER
  - tra về lỗi
  - trã về schema_method thuc hien function khác từ object


*/
module.exports = function (options = {}) {
  return async context => {

    let { data, params } = context;
    const Helper = options.Helper;

    const id = context.id ;
    let data_out = {};

    /* DETECT ID */
    params.isMethod = id !==null  && isNaN(id) ? true : false ;

    data_out.message =  params.isMethod ? '' : 'Vui lòng kiểm tra method ' ;
    data_out.name = data_out.message === '' ? 'success' : 'hook-error';

    if(params.isMethod){

        Object.assign(data_out,{
          method:id
        });

    }

    /* change all json object to string value */
    /* change all json object to string value */
    Helper.covertJsonFieldToString(data);
    Helper.clearFieldNull(data);

    params.data = data_out ;

    return context;
  };
};
