
/*
  Guy :  thêm field mặc định : date_modified
        => assign date_modified => data
        => trả về : hook data; cấu trúc mới
*/

const myTime = require('../ultil/myTime');



module.exports = function (options = {}) {
  return async context => {

    let {data} = context;

    Object.assign(data,{
      updatedAt: myTime.unixTime()
    })

    return context;
  };
};
