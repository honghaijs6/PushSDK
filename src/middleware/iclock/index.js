


const bodyParser = require('body-parser');
const mDeviceMeetServer = require('./DeviceMeetServer') ;


const iclock = (app)=>{

  const DeviceMeetServer = new mDeviceMeetServer(app);
  /* METHOD POST */
  app.post('/iclock/:param',  bodyParser.raw({ type : '*/*' }), async (req,res)=>{

    DeviceMeetServer.doPost(req,res) ;

  });

  /*  METHOD : GET */
  app.get('/iclock/:param', async (req,res)=>{

    DeviceMeetServer.doPost(req,res) ;

  });

};

module.exports = iclock ;
