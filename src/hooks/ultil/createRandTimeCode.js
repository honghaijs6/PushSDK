


const createRandTimeCode = (prefix='1')=>{

    return new Promise((resolve, reject)=>{

      setTimeout(()=>{
        const date = new Date();

        const Year = date.getFullYear();
        const Month = date.getMonth() + 1;
        const Day = date.getDate();
        const Hour = date.getHours();
        const Minute = date.getMinutes();
        const Second = date.getSeconds();
        const MiliScond = date.getMilliseconds();


        let code = ( (Month -1)*31 + (Day-1))*(24*60*60) + Hour* 60 *60 + Minute*60  + MiliScond;

        const retValue =   prefix.toString() + code.toString().substr(1,6);
        resolve(retValue);

      },20)

    })

}

module.exports = createRandTimeCode ;
