
/*
  THIS GUY :
  - FOLLOW GET IN DATA SCHEMA : TO GET ERROR ON APP Object
  - continue do action for generate JSON field
  method params :  HELPER - SCHEMA FOR JSON FIELDS
  - RETURN HOOK DATA.JSON
*/


module.exports = function (options = {}) {
  return async context => {

    const Helper = options.Helper;

    let {data} = context ;

    const data_out = context.app.get('data_out');

    if(data_out.name ==='success'){

       const schema = options.schema || ['field'];
       let obj = `{`;

       schema.forEach((item)=>{
         const value = data[item].length>0 ? Helper.khongdau(data[item]) : '';
         obj += ` "${ item }" : "${ value }",`;
       });

       obj = obj.substring(0, obj.length - 1);
       obj += `}`;

       obj = JSON.parse(obj);

       Object.assign(data,{
         json:JSON.stringify(
           obj
         )
       });

     }

    return context;
  };
};
