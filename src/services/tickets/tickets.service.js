
/*
  RELATIONSHIP WITH

   NO ONE


*/
const mode = 'tickets';


const myService = require('./'+mode+'.class');
const hooks = require('./'+mode+'.hooks');




module.exports = function(app){

  /* ROUTE : /users */
  app.use('/'+mode,myService({app})) ;
  app.use('/'+mode+'/:method',myService({app})) ;

  const service = app.service(mode);
  service.hooks(hooks);


   /// public realtim  event to room : authenticated
   /*service.publish((data, context) => {

    if(data.name==='success'){

      return app.channel('authenticated') ;

    }

  });*/



}
