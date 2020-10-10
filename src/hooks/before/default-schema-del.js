/*
  Guy :  cấu trúc xoá
        => trả về lỗi nếu ID = null || text
        => trả về thành công : thông tin kèm theo
              thong tin nguoi xoá
              thông tin ngày xoá
              thông tin nơi xoá :             [để sau]
              thông tin : comment lý do xoá : [để sau]
              thông tin log xoá :             [để sau]
*/
module.exports = function (options = {}) {
  return async context => {

    let { params} = context ;
    const userInfo = context.params.user;

    const {id} =  context;
    let data_out = {};

    data_out.message = id === null ||  isNaN(id) ? 'Vui lòng xem lại ID' : '';
    data_out.name = id === null || isNaN(id)  ? 'hook-error' : 'success';
    data_out.data = {
      is_deleted:1,
      deleted_by:userInfo.id,
      date_deleted: new Date()
    }
    data_out.id = id ;
    data_out.type = context.method;
    data_out.model = context.service.Model.name;
    data_out.token = context.params.headers.authorization ;

    params.data = data_out;

    return context;

  };
};
