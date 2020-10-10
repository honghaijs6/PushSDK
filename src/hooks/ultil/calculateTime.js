
/*
this function using for device format time only

*/

const calculateTime = (start, end)=>{

  const startHour = parseInt(start.split(":")[0]);    //Integer.valueOf(start.split(":")[0]);
  const startMin = parseInt(start.split(":")[1]); //Integer.valueOf(start.split(":")[1]);
  const endHour =  parseInt(end.split(":")[0]);  //Integer.valueOf(end.split(":")[0]);
  const endMin =  parseInt(end.split(":")[1]);  //Integer.valueOf(end.split(":")[1]);
  const value = ((startHour*100+startMin) << 16 ) + endHour*100 + endMin ;
  
  return value;

};

module.exports = calculateTime ;
