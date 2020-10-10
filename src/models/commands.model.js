const NeDB = require('nedb');
const path = require('path');

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'commands.db'),
    autoload: true
  });

  const model = Object.assign(Model,{


    add(sn="",cmd=""){


      return new Promise((resolve,reject)=>{

        const moCmdLogs = app.service('command_logs') ;

        moCmdLogs.Model.count({},(err,count)=>{
          const cmdIndex = count + 100 ;

          const data = {
            _index : cmdIndex,
            sn:sn,
            cmd:cmd
          }

          Model.insert(data,(err,docs)=>{

            //resolve(docs) ;


            // WAIT FOR REALTIME LOG

            moCmdLogs.on('logs',(retJson)=>{

              resolve(docs);

            });


          });


        });
      })

    }
  })

  return model;
};
