/*
PLUGIN USERINFO :

  params.data.userInfo = {

 }

*/

module.exports = function(options={}){
  return async (context)=>{

    let {params} = context;

    const userInfo = context.params.user;

    params.userInfo = {
      id:userInfo.id,
      name:userInfo.name,
      gender:userInfo.gender,
      is_leader:userInfo.is_leader
    }

    return context;


  }
}
