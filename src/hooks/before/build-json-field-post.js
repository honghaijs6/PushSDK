
/*
  - BUILD JSON FIELD AUTO : FOLLOW SCHEMA PASSEDD
  - THIS ACTIONS USE FOR : SEARCH DATA EASY
  
*/


module.exports = function (options = {}) {
  return async context => {

    const Helper = options.Helper;

    let {data, params } = context ;
    const data_out = params.data ; // recieved from previous hook method ;

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
