const myTime = require('../ultil/myTime');
/*
gắng thêm các field mặc định cho method POST : CREATE
*/

module.exports = function (options = {}) {
  return async context => {

    let { data } = context;
    //let { user } = context.params


    try{
      Object.assign(data,{
        createdAt: myTime.unixTime()
      });

    }catch(err){ throw err }

    return context;

  };
};
