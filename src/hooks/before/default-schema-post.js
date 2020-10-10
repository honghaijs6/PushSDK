/*

  - SET DEFAULT SCHEMA DATA JSON {} FOR INSERT DATATA
  - COVERT ALL JSON FIELD -> STRING
  - CONERT ALL FIELD NULL VALUE => DELETED

*/
module.exports = function (options = {}) {
    return async context => {

      const Helper = options.Helper;
      let {params, data} = context;


      let data_out ={}
      const schema =  options.schema ||   ['field'];

      const filers =  Helper.isPassedSchema(schema,Object.keys(data))
      data_out.message = filers === '' ? '' : ' Vui lòng kiểm tra  '+filers;
      data_out.name = data_out.message === '' ? 'success' : 'hook-error';
      data_out.data = data ;

      data_out.type = context.method;
      data_out.model = context.service.Model.name;
      data_out.token = context.params.headers.authorization ;

      /* change all json object to string value */
      //Helper.covertJsonFieldToString(data);
      Helper.clearFieldNull(data);


      params.data = data_out;

      return context;
    };
  };
