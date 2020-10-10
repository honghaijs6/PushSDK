

const mCommand = require('../../models/commands.model') ;

var readline = require('readline');
var stream = require('stream');



let comands = [];
let DELETE_DB_CMD = [] ;

let COUNT = 1 ;


class mDeviceMeetServer {




  /* DATA */

  /* END DATA*/
  constructor(app){

    this.app = app ;
    this._isRegiter  = false;

    this._isReallyWaitCommand = false ;


  }

  // RETURN STRRING VALUES
  _getStreamDatas(req){

    return new Promise((resolve,reject)=>{

      const data = req.body ;
      var buf = new Buffer.from(data);

      var bufferStream = new stream.PassThrough();
      bufferStream.end(buf);

      var rl = readline.createInterface({
        input: bufferStream,
      });


      rl.on('line',  (line)=> {
          //console.log('this is ' + (++count) + ' line, content = ' + line);

          const strVal = line.replace(/\t/g,"&");
          //const json = url; //this.conUrlToJson(url);

          resolve(strVal) ;


      });

    }).catch((err)=>{ reject(err) }) ;

  }
  _getStreamData(req,onSuccess){

    //const stream = request.getInputStream();
    const data = req.body ;
    var buf = new Buffer.from(data);

    var bufferStream = new stream.PassThrough();
    bufferStream.end(buf);

    var rl = readline.createInterface({
      input: bufferStream,
    });


    rl.on('line', function (line) {
        //console.log('this is ' + (++count) + ' line, content = ' + line);

        onSuccess(line) ;
        //console.log(line)

    });

  }

  conUrlToJson(strValue){


    try{

      let str = strValue.replace("transaction ","");
      str = str.replace("user ","");
      str = str.replace("userauthorize ","");
      str = str.replace("timezone ","");


      return JSON.parse('{"' + decodeURI(str).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\s/g,'') + '"}');


    }catch(err){

    }





  }
  // POST : RESPONE FOR DEVICE INTERACT
  /*
    -cdata
    -registry
    -push


  */



  /*
  VERIFY WITH DATABASE
  */
  _doVerifyTicket(json){


    /*this.moCoupon.getInfoByCode(json.cardno).then((res)=>{
      const info = res.data ;
      if(info.id !== undefined ){

        // REMOTE OPEN HERE
        const door = json.eventaddr ;
        const retValue = "C:"+COUNT+":CONTROL DEVICE 010"+door+"0101" ;
        comands.push(retValue) ;

        DELETE_DB_CMD.push({
          id:info.id,
          cardno:json.cardno
        });

      }
    }).catch((err)=>{
      console.log(err) ;
    })*/

  }

  _doDeleteCardOnDevice(json){

    try{
      const retValue = "C:"+COUNT+":DATA DELETE user Pin="+json.pin+"\r\n";
      comands.push(retValue) ;

    }catch(err){}



  }


  _parseDevState(json,sn){

    /*const lockCount = 4 ;


		const sensor = this._getBinary(json.sensor, lockCount, 2, false);
    //relay = getBinary(relay, lockCount, 1, false);

    //door=getBinary(door, lockCount, 8, false);

    return {
      sensor
    }*/

  }
  _getBinary(hexStrValue="", lockCount=4, bitConvert=1, reverse=true){

    var setValue = "";
                var intValue = 0;
                if (reverse) {
                    var validLetterLen = (bitConvert * lockCount / 4 | 0);
                    for (var i = 0; i < (validLetterLen / 2 | 0); i++) {
                        {
                            setValue += hexStrValue.substring(validLetterLen - (i + 1) * 2, validLetterLen - i * 2);
                        }
                        ;
                    }
                    intValue = parseInt(setValue, 16);
                }
                else {
                    intValue = parseInt(hexStrValue, 16);
                }
                var ret = "";
                var sum = 0;
                for (var i = 0; i < bitConvert; i++) {
                    {
                        sum += Math.pow(2, i);
                    }
                    ;
                }
                for (var i = 0; i < lockCount; i++) {
                    {
                        if ((function (o1, o2) { if (o1 && o1.equals) {
                            return o1.equals(o2);
                        }
                        else {
                            return o1 === o2;
                        } })("", ret)) {
                            ret += (intValue & sum);
                        }
                        else {
                            ret += "," + ((intValue >> bitConvert * i) & sum);
                        }
                    }
                    ;
                }
                return ret;
  }


  _createRegCode(sn){

    // RANDOM 10 DIGITAL
    return Math.random().toString(36).substring(2,12) + Math.random().toString(36).substring(2,2);


  }



  async doPost(req,res){

    let retValue = 'ok';
    res.header("Content-Type", "text/plain");

    const params = req.params;
    const query = req.query;

    try{

      const pathValue = params.param;
      const sn = query.SN ;

      if(pathValue==='cdata'){

          let type = query.table ;
          if(type == null && query.AuthType != null){
              type = "BGV";// background verification ;
              console.log("background verification");

          }

          type = type == null ? "isConnect" : type;

          if(type==='isConnect'){
              console.log("***************/cdata type=isconnect  || first step: set up connections between device and server***************") ;
          }else if(type==='rtstate'){
              console.log("***************/cdata type=rtstate  || post device's state to server***************") ;

              this._getStreamDatas(req).then((json)=>{
                console.log(json) ;
                this._parseDevState(json,sn);
              })
          }else if(type==='rtlog'){
              console.log("***************/cdata type=rtlog  || post device's event to server***************") ;

              const strVal = await this._getStreamDatas(req) ;
              let json = this.conUrlToJson(strVal) ;

              console.log(json);

              /*this._getStreamDatas(req).then((json)=>{

                let eventName = '';
                console.log(json) ;

              })*/

          }else if(type==='BGV'){
              console.log('***************/cdata type=BGV  || background verification***************');
              console.log('◎background verification: ');

          }else{
            console.log("***************/cdata type=unknown  || request:"+type+"***************");

          }

      }else if(pathValue==='registry'){
          console.log('***************/registry  || Start to regist***************');
          retValue = await this._registryDevice(req) ;


      }else if(pathValue==='push'){
        console.log("***************/push  || device get parameters from server***************");
        retValue = await this._getServiceParamete(sn);

      }else if(pathValue==='getrequest'){
        console.log("device say : give me instructions");

        retValue = await this._getCommandServer(sn) ;


        // CALL DATATABSE COMMAND

      }else if(pathValue==='devicecmd'){
        console.log("***************/devicecmd  || return the result of executed command to server***************");

        const strVal = await this._getStreamDatas(req) ;
        let json = this.conUrlToJson(strVal) ;
        json['sn'] = sn;

        // SAVE DATABASE COMMAND RETURN : quyet dinh thanh cong hay ko ? cua 1 command :
        console.log(json) ;



      }else if(pathValue==='querydata'){
        console.log("***************/querydata  ||response the server with person data that server asked***************");

        let ret = {
          status:"err",
          data:{}
        }

        this._getStreamDatas(req,(line)=>{
          const url = line.replace(/\t/g,"&");

          const json = this.conUrlToJson(url);
          console.log(json) ;
          console.log("======================== QUERY DATA RETURN")




          console.log("===========END QUERY ===========================") ;
        });







      }else{

        console.log("***************unknown request:"+pathValue+"***************");
        retValue="404";

      }


    }catch(err){
      retValue = "404";

    }


    res.send(retValue);
    COUNT+=1 ;
    console.log(":::: cureent retValue:"+retValue);
    //console.log("COUNT : "+COUNT);


  }

  // LOAD COMMAND QUEZE FROM
  _getCommandServer(sn){

      return new Promise((resolve,reject)=>{

        let retValue = "ok";
        const moCommand = this.app.service('commands') ;

        moCommand.Model.count({sn:sn},(err, count)=>{

          if(count>0){
            moCommand.Model.find({sn:sn}).sort({ createdAt: 1 }).limit(1).exec((err, docs)=>{


              //console.log(docs);
              retValue = `C:${COUNT}:${ docs[0]["cmd"] }`;


              // REMOVE ITEM
              moCommand.Model.remove({ _id: docs[0]["_id"] }, {}, (err, numRemoved)=>{
                console.log("REMOVE SUCCESS");

                resolve(retValue) ;
              });



            });
          }else{

            resolve(retValue);

          }
        });


      });
  }

  _getServiceParamete(sn){

    return new Promise((resolve,reject)=>{

      let ret = "";

      const moDevice = this.app.service('devices');

      const serverParamete = [
        "ServerVersion","ServerName","PushVersion","ErrorDelay","RequestDelay","TransTimes","TransInterval","TransTables","Realtime","SessionID","TimeoutSec"
      ];

      moDevice.Model.find({sn:sn}).sort({ createdAt: 1 }).limit(1).exec((err, docs)=>{

        if(docs.length > 0){
          const json = docs[0]['options'];
          serverParamete.map((item)=>{
            ret += item+'='+json[item]+"\n";
          })


        }

        resolve(ret);
      });

    })
  }


  /*

  */
  _registryDevice(req){

    let ret = '404';

    return new Promise((resolve,reject)=>{


      const { query } = req ;

      const moDevice = this.app.service('devices') ;

      moDevice.Model.find({sn:query.SN}).sort({ createdAt: 1 }).limit(1).exec((err, docs)=>{

        // HAVE SAVED DATA
        if(docs.length > 0){
           // GET REGISTRY CODE

           const registrycode = docs[0]['registrycode']
           ret = "RegistryCode=" + registrycode ;
           console.log("\t has been registed，register code：" + registrycode);

           resolve(ret) ;



        }else{
          // INSERT DEVICE INFO TO SERVER
          const code = this._createRegCode(); // RANDOME STRING
          this._getStreamDatas(req).then((strVal)=>{


              let json = this._parseStringToJson(strVal)

              json['ServerVersion'] = '10.2';
              json['ServerName'] = 'VK Server';
              json['PushVersion'] = '1.0';
              json['ErrorDelay'] = '1';
              json['RequestDelay'] = '1';
              json['TransTimes'] = '12:30\t14:30';
              json['TransInterval'] = '1';
              json['TransTables'] = 'User\tTransaction';
              json['Realtime'] = '1';
              json['SessionID'] = req.sessionID;
              json['TimeoutSec'] = '1';

              let optionsMap = {
                options:json,
                registrycode:code,
                sn:query.SN
              };

              // SAVE DEVICE DATATBASE
              moDevice.Model.insert(optionsMap,(err,newDocs)=>{

                console.log(newDocs) ;
                console.log(err) ;

                ret = "RegistryCode=" +code;
                resolve(ret) ;

              })


              ret = "RegistryCode=" +code;
              resolve(ret) ;



          })

        }


      });


    });


  }

  _parseStringToJson(strVal=""){

    let ret = {}
    try{
      const  options = strVal.split(",");

      options.map((item)=>{

        const subOptions = item.split("=");
        if(subOptions.length===2){
          ret[subOptions[0].replace("~","")] = subOptions[1];
        }
      });

    }catch(err){}

    return ret ;
  }


  _doPost(req,res){

    let retValue = 'ok';
    res.header("Content-Type", "text/plain");

    const params = req.params;
    const query = req.query;

    try{


      console.log("====CURREN STATE==============");
      console.log(params.param) ;

      switch(params.param){

        /* CONNECT DEVICE AND RECIEVED DATA FROM DEVICE */
        case 'cdata':


           let type = query.table ;
           if(type == null && query.AuthType != null){
              type = "BGV";// background verification ;
              console.log("background verification");

           }

           type = type == null ? "isConnect" : type;


           switch (type){

              case "isConnect":
                 console.log("***************/cdata type=isconnect  || first step: set up connections between device and server***************") ;

              break;

              case 'rtstate':

                console.log("***************/cdata type=rtstate  || post device's state to server***************") ;

                /*this._getStreamData(req,(line)=>{
                })*/

              break;

              case 'rtlog':
                console.log("***************/cdata type=rtlog  || post device's event to server***************");

                this._getStreamData(req,(line)=>{
                    //console.log(line) ;
                    const url = line.replace(/\t/g,"&");
                    const json = this.conUrlToJson(url);

                    console.log(json) ;

                    if(json.cardno !=="0"){

                      if(json.pin==="0"){
                        console.log(" =============== QUET TICKET ==================") ;
                        this._doVerifyTicket(json) ;

                      }else{
                        console.log(" =============== QUET THE ==================") ;

                        this._doDeleteCardOnDevice(json)

                      }

                      //retValue = "C:"+COUNT+":CONTROL DEVICE 01010101" ;
                      //comands.push(retValue) ;
                    }


                }) ;


              break;

              case "BGV":

                console.log("***************/cdata type=BGV  || background verification***************") ;
                console.log("◎background verification : "+query.AuthType) ;

                this._getStreamData(req,(datas)=>{
                  console.log("\t device event data："+datas) ;
                });

              break ;

              default :
                console.log("***************/cdata type=unknown  || request:"+type+"***************")
              break;


           }


        break;

        /* CREATE RANDOM CODE AND REGISTER FOR DEIVICE   */
        case 'registry':

           console.log("========REGISTRY=============") ;
           const regCode = this._createRegCode(query.SN);



           if(!this._isRegiter){
              console.log('***************/registry  || Start to regist***************');

              retValue = "RegistryCode="+regCode //+query.SN ;
              console.log("====sn: "+query.SN)
              console.log("has been registed，register code : "+regCode) ;
              this._isRegiter = true ;

           }else{
              retValue = "RegistryCode="+regCode;//+query.SN ;
              //console.log("has registed :"+query.SN) ;
           }



        break ;

        /* SETING SERVER - DEIVCE INFOMATION HANDSHACK  */
        case 'push':

          console.log("PUSH ME")
          console.log('***************/push  || device get parameters from server***************');
          retValue = "ServerVersion=1.0\nServerName=VKServer\nPushVersion=5.6\nErrorDelay=1\nRequestDelay=1\nTransTimes=12:30\t14:30\nTransInterval=1\nTransTables=User\tTransaction\nRealtime=1\nSessionID="+req.sessionID+"\nTimeoutSec=1";


        break;

        /* DEIVCE ASK SERVER COMMAND TO RUN HERE  */
        case 'getrequest':
          console.log('device say : give me instructions : '+query.SN);

          this._isReallyWaitCommand = true ;

          //retValue = "C:101: CONTROL DEVICE 01010103" ;
          //comands.push(retValue) ;


          //retValue = "seen";
          //res.send("C:101: CONTROL DEVICE 01010103");

          // REQUEST COMMAND FROM DATABAS E
          try{

            if(this._isReallyWaitCommand){

              const moCommand = this.app.service('commands') ;

              moCommand.Model.count({},(err, count)=>{
                if(count>0){
                  moCommand.Model.find({}).sort({ createdAt: 1 }).limit(1).exec(function (err, docs) {


                    //console.log(docs);
                    retValue = `C:${COUNT}:${ docs[0]["cmd"] }`;
                    comands.push(retValue) ;


                    // REMOVE ITEM
                    moCommand.Model.remove({ _id: docs[0]["_id"] }, {}, function (err, numRemoved) {
                      console.log("REMOVE SUCCESS");
                    });



                  });
                }
              });
            }


          }catch(err){
            console.log(err)
          }





        break;

        /* DEVICE RETURN QUERY DATA FROM STATE : getrequest  */
        case 'querydata':
          console.log("***************/querydata  ||response the server with person data that server asked***************");

          this._getStreamData(req,(line)=>{
            const url = line.replace(/\t/g,"&");

            const json = this.conUrlToJson(url);
            console.log(json) ;
            console.log("======================== QUERY DATA RETURN")




            console.log("===========END QUERY ===========================") ;
          });

        break ;


        /* DEVICE RETURN RESULT FOR RUNNING DEVICE  */
        case 'devicecmd':
          console.log("***************/devicecmd  || return the result of executed command to server***************") ;

          this._getStreamData(req,(line)=>{

            const url = line.replace(/\t/g,"&");
            const json = this.conUrlToJson(url);

            try{

              console.log(json);
              if(parseInt(json.Return) >= 0){

                if(DELETE_DB_CMD.length > 0){

                  const item = DELETE_DB_CMD[0];

                  /*this.moCoupon.destroy({
                    where:{
                      id:item.id
                    }
                  }).then((res)=>{
                    console.log("======delete DB success=========");
                    DELETE_DB_CMD.shift();
                  });*/


                }
              }

            }catch(err){
              console.log("================ ERROR RETURN FROM DEVICE") ;
            }

          })

        break ;



        default :
          console.log("***************unknown request: **************") ;
          //retValue = "404";

        break ;


      }
    }catch(err){
      retValue = "404";

      console.log("===ROROROROOROR==================")
    }




    res.status(200)

      if(comands.length >0){
          retValue = comands[0];
          comands.shift();
      }

      res.send(retValue);
      COUNT+=1 ;
      console.log(":::: cureent retValue:"+retValue);
      console.log("COUNT : "+COUNT)




  }





}

module.exports =   mDeviceMeetServer;
