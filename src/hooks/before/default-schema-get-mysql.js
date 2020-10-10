
/*

  FORMAT SCHEME FOR FIND METHOD FIRST

*/

module.exports = function (options = {}) {
  return async context => {

    const Helper = options.Helper;
    let {params} = context ;
    let {query} = context.params;


    let strQuery = JSON.stringify(query);

    /* BASIC SCHEMA */
    if(! strQuery.includes('$limit')){

      const paginate = context.app.get('paginate');

      query.p = query.p || 0 ;
      query.offset = query.offset || 0 ;
      query.max = query.max || paginate.max ;
      query.sort_by =  query.sort_by || 'id';
      query.sort_type = query.sort_type || 'desc';

      query.basicQuery = {
          order:[
            [ query.sort_by || 'id' , query.sort_type || 'desc' ]
          ],
          offset: parseInt(query.offset),
          limit: parseInt(query.max)
      };

      query.max === 'all' ? delete query.basicQuery.limit : '';

      delete query.p ;
      delete query.offset;
      delete query.max ;
      delete query.sort_by ;
      delete query.sort_type ;

      /* end BASIC SCHEMA */
      /* FULL SCHEMA  */
      const basic = query.basicQuery;
      delete query.basicQuery;

      query.is_deleted === 'undefined' ? Object.assign(query,{ is_deleted:0 }) :  '';

      const key = query.key || '' ;
      delete query.key ;

      if(key!==''){
          Object.assign(query,{
            json: {
              $like: '%'+Helper.khongdau(key)+'%'
            }
          })
      }

      const where = {
          where: {
              $and: query
           }
      };
       const schema = Object.assign({},where,basic);

       params.schema = schema;

       /* END FULL SCHEMA */
    }


    return context;
  };
};
