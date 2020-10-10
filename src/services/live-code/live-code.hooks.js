//const { authenticate } = require('@feathersjs/authentication').hooks;


const Helper = require('../../hooks/ultil/helper');
//const Helper = require('../../models/helper');




/* BEFORE : HTTP GET */
const pluginUserInfo = require('../../hooks/before/plugin-userinfo');
const defautSchemaGet = require('../../hooks/before/default-schema-get'); // -> GET Default SCHEMA QUERY DATABASE
/* POST */
const defaultSchemaPost = require('../../hooks/before/default-schema-post');
const buildJsonFieldPost = require('../../hooks/before/build-json-field-post');
const defaultKeyFieldPost = require('../../hooks/before/default-key-field-post');

/* ERROR*/
//const consoleError = require('../../hooks/error/console-error');


/* HTTP: PUT */
const isMethod = require('../../hooks/before/isMethod');
const defaultSchemaPut = require('../../hooks/before/default-schema-put');
const defaultKeyFieldPut = require('../../hooks/before/default-key-field-put'); /* updatedAt, log =[change ] */



/* HTTP: DELETE */
const defaultSchemaDel = require('../../hooks/before/default-schema-del');



module.exports = {
    before: {
      all: [],
      find: [

        defautSchemaGet({Helper})
      ],
      get: [],
      create: [
        //pluginUserInfo(),

        defaultSchemaPost({Helper,schema:['pin','sn']}), /* this guy return err: on missing Default field */
        buildJsonFieldPost({ Helper ,schema :['pin','sn'] }), // This guy create json field stringify
        defaultKeyFieldPost(),



      ],
      update: [

        defaultSchemaPost({Helper,schema:['pin']}),
        buildJsonFieldPost({ Helper ,schema :['pin'] }), // This guy create json field stringify
        defaultKeyFieldPut(), // auto add updatedAt field

      ],
      patch: [

        defaultSchemaPost({Helper,schema:['pin']}),
        buildJsonFieldPost({ Helper ,schema :['pin'] }), // This guy create json field stringify
        defaultKeyFieldPut(), // auto add updatedAt field


      ],
      remove: [
        //authenticate('jwt')
      ]
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  };
