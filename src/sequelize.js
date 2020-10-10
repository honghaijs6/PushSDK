const Sequelize = require('sequelize');
//const { Op } = Sequelize;

module.exports = function (app) {
  const connectionString = app.get('mysql');

  const CONFIG = global.CONFIG

  const sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: false,
      freezeTableName: false,
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci'
      },
      timestamps: false,
      freezeTableName: true
    },
    timezone: 'Asia/Ho_Chi_Minh',
    sync: { force: false },
  });

  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    // Sync to the database
    sequelize.sync();

    return result;
  };
};
