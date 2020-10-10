// Initializes the `users` service on path `/users`


const mode = 'command_logs';

const myService = require('./'+mode+'.class');
const hooks = require('./'+mode+'.hooks');


module.exports = function (app) {

    const res = myService(app);

    app.use('/'+mode,res) ;
    app.use('/'+mode+'/:method',res);



    const service = app.service(mode);
    service.hooks(hooks);

};
