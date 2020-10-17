

//const oracledb = require('oracledb');

const constants = require('./ultils/constants');
const myTime = require('../../hooks/ultil/myTime') ;


const createRandTimeCode = require('../../hooks/ultil/createRandTimeCode') ;

const readline = require('readline');
const stream = require('stream');


let COUNT = 1 ;


class mDeviceMeetServer {




  /* DATA */

  /* END DATA*/


  constructor(app){

    this.app = app ;



    this.registrycodes = [];

    this._isRegiter  = false;

    this._isReallyWaitCommand = false ;

    //console.log(constants.baseEvents);

    this.eventNames = constants.baseEvents ;
    this.inOut = constants.inout ;
    this.verifyModes = constants.verifyModes ;

    this.internalCmd = [] ;

    this.curCmdIndex = 0 ;

    this._indexLiveCode = 0 ;

    this.ORA_CONNECT = null; 

    //this._initOracle();

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

    try{

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
          const strVal = line.replace(/\t/g,"&");
          onSuccess(strVal) ;
          //console.log(line)

      });

    }catch(err){}


  }

  conUrlToJson(strValue){


    try{


      //console.log(strValue) ;

      let str = strValue.replace("transaction ","");
      str = str.replace("user ","");
      str = str.replace("userauthorize ","");
      str = str.replace("timezone ","");

      try{

        let json = JSON.parse('{"' + decodeURI(str).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\s/g,'') + '"}');

        /*if(json.cardno){
          json.cardno =  parseInt(json['cardno'],16) //.toString(16);

        }*/

        return json ;  //JSON.parse('{"' + decodeURI(str).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\s/g,'') + '"}');

      }catch(err){
        return  this._parseStringToJson(str)
      }





    }catch(err){

    }





  }
  // POST : RESPONE FOR DEVICE INTERACT
  /*
    -cdata
    -registry
    -push


  */







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



  /* SEND OUT SOCKET  */
  _emitRealtimeLog(json={}){


    // UPDATE DATABASE REALTIME 
    const moRealtime = this.app.service('realtime').Model;
    moRealtime.update({
      _id:"yD1INnriFNvYoF0a"
    },{
        $set:{
          ...json,
          updatedAt:myTime.unixTime(),
        }
    },{ multi:true },(err,numReplaced)=>{
        
      console.log("UPDATE DATABASE REALTIME SUCCESS", numReplaced);
    
    });  

    
    // QUERY DEVICE
    const moDevice = this.app.service('devices');
    moDevice.Model.find({sn:json.sn}).limit(1).exec((err,docs)=>{

      if(docs.length >0){

        const data = docs[0];
        let retData = Object.assign({
          name: data.name,
          gate_no:data.gate_no,
          ip:data.options.IPAddress  
        },json);

        this.app.service('realtime-logs').emit('logs', retData);

        
      }
    });

   

  }

  /* SEND OUT SOCKET COMMAND-LOG */
  _emitCmdLogs(json={}){

    try{
      const { data } = json ;
      const index = data.ID ;
      const moCmdLog = this.app.service('command_logs') ;

      if(index == this.curCmdIndex){



        moCmdLog.Model.update({
          _index:parseInt(index)
        },{
          $push:{
            response:data
          }
        },{},(err,numReplaced)=>{


          this.app.service('command_logs').emit('logs', json);


        })

      }


    }catch(err){}

  }


  /* SEND OUT SOCKET QUERY LOGS */
  _emitQueryLogs(json={}){
    this.app.service('query_logs').emit('logs',json) ;
  }



  _pushCodeToDevice(arr,newCode,sn=null){

    console.log("CALL ME HERE PUSH HERE BABE");
    let arrList = arr;
    if(sn!==null){
     arrList =  this._resortArr(arr,sn)
    }
    
     //if(arrList.length > this._indexLiveCode ){

       //const doc = arrList[this._indexLiveCode];
       const moCommand = this.app.service('commands').Model ;

       
      // FORMAT DATA FIRST 

       let listCommand = [];
       arrList.forEach( async (item, index)=>{

          const doc = item; //arrList[this._indexLiveCode] ;
          let cmd = "CardNo="+newCode+"\t"+
              "Pin="+doc.pin+'\t'+
              "Password="+'\t'+
              "Group="+'\t'+  
              "StartTime="+'0' +'\t'+
              "EndTime="+'0' +'\t'+
              "Name="+'no-name'+'\t'+
              "SuperAuthorize=0"+'\t'+
              "Disable="+ 0 +'\r\n'+
  
              "";
  
          cmd = "DATA UPDATE user "+cmd;

          const data = {
            _index : Math.round(Math.random() * 1000000000),
            sn:doc.sn,
            cmd:cmd,
            createdAt:myTime.unixTime(),
            updatedAt:0
          };

          listCommand.push(data);
          
          /*moCommand.add(doc.sn,cmd).then((res)=>{
            //this._indexLiveCode += 1 ;
            console.log("============PUSHED "+index+" DONE ==============");
            //this._pushCodeToDevice(arrList,newCode, null);
          });*/

          
       });

       moCommand.addMulti(listCommand);
       console.log("============PUSHED "+listCommand.length+" DONE ==============");

       
       


     /*}else{
       this._indexLiveCode = 0 ;

     }*/
  }

  _resortArr(arr,sn){
    
    let newArr = [];
    arr.forEach((item,index)=>{
      if(item.sn === sn){
        newArr.push(item);
      }
    });
    const newArr2 = [...new Set([...newArr,...arr])];

    return newArr2;
  }

  _openDevice(sn,json){


    console.log("=== COMMAND OPEN DOOR===")
    console.log(json);
    
    const door = 1;//json.eventaddr.replace("Door ","")  ;
    const cmdOpen = "CONTROL DEVICE 010"+door+"0101" ;

    console.log("==OPEN DOOR COMMAND ===");
    console.log(cmdOpen);


    const item = {
      _index : Math.round(Math.random() * 1000000000),
      sn:sn,
      cmd: cmdOpen
    };

    this.internalCmd.push(item);


  }

  
  async _checkLocalData(sn,json){
    
    // CHECK LOCALDATA FIRST THEN OPEN DEVICE 
    const moLiveCode = this.app.service('live-code').Model;
    try{

      moLiveCode.find({cardno:json.cardno},async (err,docs)=>{
        if(err===null){
          if(docs.length>0){

            // OPEN DEVICE HERE 
            /*const moCommand = this.app.service('commands').Model ;
            const door = json.eventaddr.replace("Door ","")  ;
            const cmdOpen = "CONTROL DEVICE 010"+door+"0103" ;
            
            await moCommand.add(sn,cmdOpen);*/

            this._openDevice(sn,json);

            
            // MAKE CHANGE DEVICE CODE ;

            const doc = docs[0];
            if(doc.type === "qrcode"){
              //1 :  CREATE RE-NEW CODE
              //const preCode = doc.gate_no + doc.type_no ; // MÃ CỔNG - LOẠI VÉ
              const newCode = createRandTimeCode(doc); 

              //createRandTimeCode(doc).then((newCode)=>{ 

                 // PUSH NEW CODE FOR MULTI DEVICES
                 console.log("===NEW CODE CREATED ===");
                 console.log(newCode);

                 this._pushCodeToDevice(docs,newCode,sn) ;

                 console.log("===HAVE PUSHED TO MULTI DEVICES");

                 

                 moLiveCode.update({
                   cardno:doc.cardno
                 },{
                   $set:{
                     cardno:newCode,
                     updatedAt:myTime.unixTime(),
                     //json: JSON.stringify({ cardno:newCode, sn:doc.sn})

                   }
                 },{ multi:true },(err,numReplaced)=>{


                   if(numReplaced > 0){
                     console.log("======: RENEW-CODE ====" + numReplaced);
                    
                     // 4 : INSERT TICKETS MYSQL DB AS LOGS FILE
                    const moTicket = this.app.service('tickets') ;
                    //let newDoc = Object.assign(doc,{});
                    let newDoc = Object.assign(doc,{ sn: json.sn});
                    newDoc.door = json.eventaddr.replace("Door ","")  ; 
                    newDoc.is_remote_open = 1;
                    moTicket.Model.create(newDoc) ;

                    // 5: UPDATE LIVE-CODE MULTI RECORD
                    console.log("==== UPDATE DATA MYSQL DONE ==== ");

                  }

                 })



              //}) ;

            }else{
              console.log("====YOU WIPED MIFARE CARD ==========");
            }
            // END MAKE CHANGE CODE 

          }else if(json.cardno === '1110381817'){
            // OPEN DEVICE : only test 

            console.log("=============OPEN REMOTE=========");
            const moCommand = this.app.service('commands').Model ;
            const door = json.eventaddr.replace("Door ","")  ;

            console.log(json);
            const cmdOpen = "CONTROL DEVICE 010"+door+"0103" ;
            
            await moCommand.add(sn,cmdOpen);
            

          }
        }
  
      });

    }catch(err){}
    



  }

  


  getFullDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    var hh= today.getHours();
    var mins = today.getMinutes();
    var ss = today.getSeconds();

    if(dd<10) {dd='0'+dd;}
    if(mm<10) {mm='0'+mm;}

    if(hh<10) {hh='0'+hh;}
    if(mins<10) {mins='0'+mins;}
    if(ss<10) {ss='0'+ss;}  
    //03.07.2018 12:34:45
    return dd+'.'+mm+'.'+yyyy+' '+hh+':'+mins+':'+ss;

  }

  converToCasino(no){

      var myCode = parseInt(no).toString(16).toUpperCase();
      var a1 = myCode.substr(myCode.length - 2);
      var a2 = myCode.substr(4,2);
      var a3 = myCode.substr(2,2);
      var a4 = myCode.substr(0,2);    

      return a1 + a2 + a3 + a4;

  }

  converToCasinoHexa(myCode){

    var a1 = myCode.substr(myCode.length - 2);
    var a2 = myCode.substr(4,2);
    var a3 = myCode.substr(2,2);
    var a4 = myCode.substr(0,2);  

    return a1 + a2 + a3 + a4;
  }
  
  async _isWiped(sn,json){

    console.log(json) ;
    // SEND THONG TIN QUA IQ SYSTEM 
    if(json.event === "27"){ // UNREGISTER PERSONEL
      
      
      //this._pushOracle(sn,json);
      //this._openDevice(sn,json);



    }

    // LAY KET QUA TRA VE 

    // MO CUA HOAC DONG CUA

    //this._openDevice(sn,json);


    //const isWipedSuccess = parseInt(json.event);
    
         
    /*if(json.event==="0"){
      try{

        const moLiveCode = this.app.service('live-code').Model;

        moLiveCode.find({cardno:json.cardno},(err,docs)=>{


          console.log(" MY CODE HERE ");
          console.log(docs);
          if(err===null){

            if(docs.length > this._indexLiveCode){

                const doc = docs[0];

                if(doc.type === "qrcode"){
                  //1 :  CREATE RE-NEW CODE
                  const preCode = doc.gate_no + doc.type_no ; // MÃ CỔNG - LOẠI VÉ

                  const newCode = createRandTimeCode(doc);

                  //createRandTimeCode(doc).then((newCode)=>{

                     // PUSH NEW CODE FOR MULTI DEVICES
                     console.log("===NEW CODE CREATED : NORMAL ===");
                     console.log(newCode);

                     this._pushCodeToDevice(docs,newCode,sn) ;

                     console.log("===HAVE PUSHED TO MULTI DEVICES NORMAL ");

                     

                     moLiveCode.update({
                       cardno:doc.cardno
                     },{
                       $set:{
                         cardno:newCode,
                         updatedAt:myTime.unixTime(),
                         //json: JSON.stringify({ cardno:newCode, sn:doc.sn})

                       }
                     },{ multi:true },(err,numReplaced)=>{


                       if(numReplaced > 0){
                         console.log("======: RENEW-CODE : NORMAL ====" + numReplaced);
                        
                         // 4 : INSERT TICKETS MYSQL DB AS LOGS FILE
                        const moTicket = this.app.service('tickets') ;
                        let newDoc = Object.assign(doc,{ sn: json.sn});
                        newDoc.door = json.eventaddr.replace("Door ","") ;  
                        
                        moTicket.Model.create(newDoc) ;


                        // 5: UPDATE LIVE-CODE MULTI RECORD
                        console.log("==== UPDATE DATA MYSQL DONE  NORMAL ==== ");

                      }

                     })



                  //}) ;

                }else if(doc.type==='master'){
                  
                  console.log("====YOU WIPED MASTER CARD ==========");
                  const moTicket = this.app.service('tickets') ;
                  //let newDoc = Object.assign(doc,{});
                  let newDoc = Object.assign(doc,{ sn: json.sn});
                  newDoc.door = json.eventaddr.replace("Door ","") ;  
                  newDoc.is_master = 1; 

                  moTicket.Model.create(newDoc) ;


                }

            }


          }else {
            console.log("================= ERROR HERE === WIPED CARD ");
          }

        })
      }catch(err){}
    }else{
      this._checkLocalData(sn,json);
    }*/

  }

  /* ON WIPED SUCCESS
      1. CREATE NEW CODE
      2. INSERT RENEW-CODE  : NEDB
      3. PUSH UPDATE DEVICE
      4. INSERT TICKETS AS LOGS FILE
      5. UPDATE RE-NEWCODE
  */
  

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

          console.log("============= DETECT HERE : sn="+sn+" =====================");

          if(type == null && query.AuthType != null){
              type = "BGV";// background verification ;
              console.log("background verification : sn="+sn);

          }

          type = type == null ? "isConnect" : type;

          if(type==='isConnect'){
              console.log("***************/cdata type=isconnect sn="+sn+"  || first step: set up connections between device and server***************") ;
          }else if(type==='rtstate'){
              console.log("***************/cdata type=rtstate  || post device's state to server : sn="+sn+" ***************") ;


              this._getStreamData(req,(strVal)=>{
                  const json = this.conUrlToJson(strVal);
                  console.log(json) ;

              })

              /*this._getStreamDatas(req).then((json)=>{
                console.log(json) ;
                this._parseDevState(json,sn);
              });*/



          }else if(type==='rtlog'){
              console.log("***************/cdata type=rtlog  || post device's event to server : sn:"+sn+" ***************") ;


              const strVal = await this._getStreamDatas(req) ;
              let json = this.conUrlToJson(strVal) ;

                

                //  UPDATE CARDNO HERE
                //await this._isWipedSuccess(sn,json) ;
                await this._isWiped(sn,json) ;

                //json.event = this.eventNames[json.event] || "unKnow event" ;
                json.eventName = this.eventNames[json.event] || "unKnow event" ;
                json.eventaddr = "Door "+json.eventaddr;
                json.inoutstatus = this.inOut[json.inoutstatus] || "Unknow Status" ;
                json.verifytype = this.verifyModes[json.verifytype];
                json.sn = sn;
                json.door = json.eventaddr;
                
                // SEND REALTIME SOCKET
                this._emitRealtimeLog(json);
                



          }else if(type==='BGV'){
              console.log('***************/cdata type=BGV  || background verification '+sn+' : ***************');
              console.log('◎background verification: ');

              const strVal = await this._getStreamDatas(req) ;
              let json = this.conUrlToJson(strVal) ;

              // SEND AS REALTIME SOCKET
              //this._emitRealtimeLog(json);


              // UPDATE CARDNO HERE
              //await this._isWipedSuccess(sn,json) ;
              //await this._isWiped(sn,json) ;


              /*this._getStreamData(req,(strVal)=>{
                //console.log(strVal);
                let json = this.conUrlToJson(strVal) ;
                console.log(json);
                let cmd = "AUTH=SUCCESS\r\nCONTROL DEVICE 1 1 1 15\r\n" ;
                //retValue = "AUTH=FAIL\r\n" ;
                this._addCommand(sn,cmd) ;
              })*/


          }else{
            console.log("***************/cdata type=unknown  || request:"+type+"***************");

          }

      }else if(pathValue==='registry'){
          console.log('***************/registry  || Start to regist : '+sn+'***************');
          retValue = await this._registryDevice(req) ;


      }else if(pathValue==='push'){
        console.log("***************/push  || device get parameters from server : sn:"+sn+"***************");
        retValue = await this._getServiceParamete(sn);

      }else if(pathValue==='getrequest'){
        console.log("device say : give me instructions : sn:"+sn);

        if(this.internalCmd.length > 0){

          this.internalCmd.forEach((item,index)=>{
            if(item.sn === sn){
              retValue = `C:${item._index}:${item.cmd}`;
              this.internalCmd.splice(index,1)
            }
          })
          

        }else{
          retValue = await this._getCommandServer(sn) ;
        }


        // CALL DATATABSE COMMAND

      }else if(pathValue==='devicecmd'){
        console.log("***************/devicecmd  || return the result of executed command to server sn: "+sn +"***************");

        let ret = {
          status:"err",
          data:{}
        }

        this._getStreamData(req,(strVal)=>{

          const json = this.conUrlToJson(strVal);

          ret = {
            status : strVal.length > 1 ? "success" : "err",
            data:json,
            sn:sn
          }

          this._emitCmdLogs(ret) ;

          console.log(ret);


        });




      }else if(pathValue==='querydata'){
        console.log("***************/querydata  ||response the server with person data that server asked : sn:"+sn+" ***************");

        let ret = {
          status:"err",
          data:{}
        }

        //const strVal = await this._getStreamDatas(req) ;
        //console.log(strVal);

        this._getStreamData(req,(strVal)=>{

          const json = this.conUrlToJson(strVal);


          ret = {
            status : strVal.length > 1 ? "success" : "err",
            data:json,
            sn:sn
          }

          this._emitQueryLogs(ret)
          console.log(ret);


        });





      }else{

        console.log("***************unknown request: sn:"+sn+"====="+pathValue+"***************");
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



              //console.log(docs);try 
              try {
                this.curCmdIndex = Math.round(Math.random() * 1000000000); // docs[0]['_index'] ===  undefined ?  Math.round(Math.random() * 1000000000) : docs[0]['_index'];
                retValue = `C:${this.curCmdIndex}:${ docs[0]["cmd"] }`;


                // REMOVE ITEM
                moCommand.Model.remove({ _id: docs[0]["_id"] }, {}, (err, numRemoved)=>{
                  console.log("REMOVE SUCCESS");

                  resolve(retValue) ;
                });  
              }catch (error) {
                console.log(error); 
              }

              



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

    /*return new Promise((resolve,reject)=>{

      let ret = "";
      //const moDevice = this.app.service('devices');
      let serverParamete = [
        "ServerVersion","ServerName","PushVersion","ErrorDelay","RequestDelay","TransTimes","TransInterval","TransTables","Realtime","SessionID","TimeoutSec"
      ];
      const docs =  this._findRegistryCode(sn);
      if(docs.length > 0){
          const json = docs[0]['options'];
          serverParamete.map((item)=>{
            ret += item+'='+json[item]+"\n";
          })
      }
      resolve(ret);
    })*/

  }


  _findRegistryCode(sn=''){

    
    return this.registrycodes.filter((item)=> item.sn === sn );

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



          this._getStreamData(req,(strVal)=>{
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
          });



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


}

module.exports =   mDeviceMeetServer;
