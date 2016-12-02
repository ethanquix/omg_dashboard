(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var Rethink, wrapCursorMethods, wrapTableMethods, attachCursorMethod;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/simple_rethink/packages/simple_rethink.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/simple:rethink/init.js                                                                                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Rethink = {};                                                                                                     // 1
                                                                                                                  // 2
if (Meteor.isClient) {                                                                                            // 3
  // generated from the driver                                                                                    // 4
  Rethink.r = ___Rethink_r___;                                                                                    // 5
  Rethink.reqlite = ___Rethink_reqlite___;                                                                        // 6
}                                                                                                                 // 7
                                                                                                                  // 8
if (Meteor.isServer) {                                                                                            // 9
  var r = Npm.require('rethinkdb');                                                                               // 10
  Rethink.r = r;                                                                                                  // 11
}                                                                                                                 // 12
                                                                                                                  // 13
                                                                                                                  // 14
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/simple:rethink/monkey-patching.js                                                                     //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var r = Rethink.r;                                                                                                // 1
var tableCursor = r.table('dummy');                                                                               // 2
var rdbvalProto = tableCursor.constructor.__super__.constructor.__super__;                                        // 3
var rdbopProto = r.table('dummy').get('dummy').constructor.__super__.constructor.__super__.constructor.prototype; // 4
var rtermbaseProto = rdbvalProto.constructor.__super__;                                                           // 5
                                                                                                                  // 6
wrapCursorMethods = function (f) {                                                                                // 7
  for (var m in rdbvalProto) {                                                                                    // 8
    if (m !== 'constructor' && rdbvalProto.hasOwnProperty(m))                                                     // 9
      wrapMethod(m, f, rdbvalProto);                                                                              // 10
  }                                                                                                               // 11
  for (var m in rdbopProto) {                                                                                     // 12
    if (m !== 'constructor' && rdbopProto.hasOwnProperty(m))                                                      // 13
      wrapMethod(m, f, rdbopProto);                                                                               // 14
  }                                                                                                               // 15
};                                                                                                                // 16
                                                                                                                  // 17
wrapTableMethods = function (f, proto) {                                                                          // 18
  for (var m in rdbvalProto) {                                                                                    // 19
    if (m !== 'constructor' && rdbvalProto.hasOwnProperty(m))                                                     // 20
      (function (m) {                                                                                             // 21
        proto[m] = function () {                                                                                  // 22
          var rt = r.table(this.name);                                                                            // 23
          var ret = rt[m].apply(rt, arguments);                                                                   // 24
          if (typeof ret === 'object' || typeof ret === 'function')                                               // 25
            f.call(this, ret, m);                                                                                 // 26
          return ret;                                                                                             // 27
        };                                                                                                        // 28
      })(m);                                                                                                      // 29
  }                                                                                                               // 30
};                                                                                                                // 31
                                                                                                                  // 32
attachCursorMethod = function (name, factory) {                                                                   // 33
  rdbopProto[name] = rdbvalProto[name] = factory(rtermbaseProto);                                                 // 34
};                                                                                                                // 35
                                                                                                                  // 36
var wrapMethod = function (method, f, proto) {                                                                    // 37
  var original = proto[method];                                                                                   // 38
  proto[method] = function () {                                                                                   // 39
    var ret = original.apply(this, arguments);                                                                    // 40
    f.call(this, ret, method);                                                                                    // 41
    return ret;                                                                                                   // 42
  };                                                                                                              // 43
  proto[method].displayName = 'monkey patched ' + method;                                                         // 44
};                                                                                                                // 45
                                                                                                                  // 46
                                                                                                                  // 47
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/simple:rethink/rethink.js                                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var Future = Npm.require('fibers/future');                                                                        // 1
var url = Npm.require('url');                                                                                     // 2
var r = Rethink.r;                                                                                                // 3
                                                                                                                  // 4
var writeMethods = [                                                                                              // 5
  'insert',                                                                                                       // 6
  'update',                                                                                                       // 7
  'replace',                                                                                                      // 8
  'delete'                                                                                                        // 9
];                                                                                                                // 10
                                                                                                                  // 11
var rethinkUrl = process.env.RETHINK_URL;                                                                         // 12
                                                                                                                  // 13
var parsedConnectionUrl = url.parse(rethinkUrl || 'rethinkdb://localhost:28015/test');                            // 14
var connection = r.connect({                                                                                      // 15
  host: parsedConnectionUrl.hostname || 'localhost',                                                              // 16
  port: parsedConnectionUrl.port || '28015',                                                                      // 17
  db: (parsedConnectionUrl.pathname || '/test').split('/')[1],                                                    // 18
  authKey: (parsedConnectionUrl.query || {}).authKey                                                              // 19
});                                                                                                               // 20
                                                                                                                  // 21
try {                                                                                                             // 22
  connection = wait(connection);                                                                                  // 23
} catch (err) {                                                                                                   // 24
  throw new Error(                                                                                                // 25
    "Error connecting to RethinkDB: " + err.message + "\n\n" +                                                    // 26
    "Set the RETHINK_URL environment variable. Example: rethinkdb://localhost:28015/database?authKey=somekey"     // 27
  );                                                                                                              // 28
}                                                                                                                 // 29
Rethink._connection = connection;                                                                                 // 30
                                                                                                                  // 31
Rethink.Table = function (name, options) {                                                                        // 32
  var self = this;                                                                                                // 33
  options = options || {};                                                                                        // 34
                                                                                                                  // 35
  self.name = name;                                                                                               // 36
  self._prefix = '/' + name + '/';                                                                                // 37
  self._dbConnection = options.dbConnection || connection;                                                        // 38
  self._connection = options.connection || Meteor.server;                                                         // 39
  self._synthEventCallbacks = [];                                                                                 // 40
  self._lastSynthEvent = 0;                                                                                       // 41
                                                                                                                  // 42
  Rethink.Table._checkName(name);                                                                                 // 43
                                                                                                                  // 44
  // define an RPC end-point                                                                                      // 45
  var methods = {};                                                                                               // 46
  methods[self._prefix + 'run'] = function (builtQuery, generatedKeys) {                                          // 47
    function FakeQuery(serializedQuery) {                                                                         // 48
      this.parsed = serializedQuery;                                                                              // 49
      this.tt = this.parsed[0];                                                                                   // 50
      this.queryString = ":(";                                                                                    // 51
    }                                                                                                             // 52
    FakeQuery.prototype.build = function () { return this.parsed; };                                              // 53
                                                                                                                  // 54
    var f = new Future;                                                                                           // 55
    self._dbConnection._start(new FakeQuery(builtQuery), f.resolver(), {});                                       // 56
    return f.wait();                                                                                              // 57
  };                                                                                                              // 58
  self._connection.methods(methods);                                                                              // 59
};                                                                                                                // 60
                                                                                                                  // 61
Rethink.Table._checkName = function (name) {                                                                      // 62
  var tables = r.tableList().run(connection);                                                                     // 63
  if (tables.indexOf(name) === -1)                                                                                // 64
    throw new Error("The table '" + name + "' doesn't exist in your RethinkDB database.");                        // 65
};                                                                                                                // 66
                                                                                                                  // 67
Rethink.Table.prototype._deregisterMethods = function () {                                                        // 68
  var self = this;                                                                                                // 69
  delete self._connection.method_handlers[self._prefix + 'run'];                                                  // 70
};                                                                                                                // 71
                                                                                                                  // 72
                                                                                                                  // 73
///////////////////////////////////////////////////////////////////////////////                                   // 74
// Monkey-patching section                                                                                        // 75
///////////////////////////////////////////////////////////////////////////////                                   // 76
wrapCursorMethods(function (ret, m) {                                                                             // 77
  ret._connection = this._connection;                                                                             // 78
  ret._table = this._table;                                                                                       // 79
  ret._writeQuery = this._writeQuery || writeMethods.indexOf(m) !== -1;                                           // 80
});                                                                                                               // 81
wrapTableMethods(function (ret, m) {                                                                              // 82
  ret._connection = this._dbConnection;                                                                           // 83
  ret._table = this;                                                                                              // 84
  ret._writeQuery = writeMethods.indexOf(m) !== -1;                                                               // 85
}, Rethink.Table.prototype);                                                                                      // 86
                                                                                                                  // 87
// monkey patch `run()`                                                                                           // 88
var originalRun;                                                                                                  // 89
attachCursorMethod('run', function (proto) {                                                                      // 90
  originalRun = proto.run;                                                                                        // 91
  return function (conn, callback) {                                                                              // 92
    if (! conn || typeof conn === 'function') {                                                                   // 93
      callback = callback || conn;                                                                                // 94
      conn = this._connection;                                                                                    // 95
    }                                                                                                             // 96
                                                                                                                  // 97
    var future = null;                                                                                            // 98
    if (! callback) {                                                                                             // 99
      future = new Future;                                                                                        // 100
      callback = future.resolver();                                                                               // 101
    }                                                                                                             // 102
                                                                                                                  // 103
    if (this._writeQuery && DDPServer._CurrentWriteFence.get()) {                                                 // 104
      var table = this._table;                                                                                    // 105
      var write = DDPServer._CurrentWriteFence.get().beginWrite();                                                // 106
      var origCb = callback;                                                                                      // 107
      var id = Math.random();                                                                                     // 108
      callback = function (err, res) {                                                                            // 109
        if (! err) {                                                                                              // 110
          // release this write only after we are sure the event was processed                                    // 111
          registerSyntheticEvent(table, function () {                                                             // 112
            write.committed();                                                                                    // 113
          });                                                                                                     // 114
        } else {                                                                                                  // 115
          write.committed();                                                                                      // 116
        }                                                                                                         // 117
        origCb(err, res);                                                                                         // 118
      };                                                                                                          // 119
    }                                                                                                             // 120
                                                                                                                  // 121
    callback = Meteor.bindEnvironment(callback);                                                                  // 122
                                                                                                                  // 123
    originalRun.call(this, conn, callback);                                                                       // 124
    if (future)                                                                                                   // 125
      return future.wait();                                                                                       // 126
  };                                                                                                              // 127
});                                                                                                               // 128
attachCursorMethod('_run', function () {                                                                          // 129
  return originalRun;                                                                                             // 130
});                                                                                                               // 131
                                                                                                                  // 132
///////////////////////////////////////////////////////////////////////////////                                   // 133
// Extra cursor methods as syntactic sugar                                                                        // 134
///////////////////////////////////////////////////////////////////////////////                                   // 135
attachCursorMethod('fetch', function () {                                                                         // 136
  return function () {                                                                                            // 137
    var self = this;                                                                                              // 138
    return wait(self.run().toArray());                                                                            // 139
  };                                                                                                              // 140
});                                                                                                               // 141
                                                                                                                  // 142
var SYNTH_EVENT_ID = 'meteor-rethink-synthetic-event';                                                            // 143
var registerSyntheticEvent = function (table, cb) {                                                               // 144
  var synthInsert = wait(table.insert({                                                                           // 145
    id: SYNTH_EVENT_ID,                                                                                           // 146
    ts: r.now()                                                                                                   // 147
  }, {                                                                                                            // 148
    returnChanges: true,                                                                                          // 149
    conflict: 'replace'                                                                                           // 150
  })._run(table._dbConnection));                                                                                  // 151
                                                                                                                  // 152
  var ts;                                                                                                         // 153
  var change = synthInsert.changes[0];                                                                            // 154
  if (change.new_val)                                                                                             // 155
    ts = change.new_val.ts;                                                                                       // 156
  else if (change.old_val)                                                                                        // 157
    ts = change.old_val.ts;                                                                                       // 158
  else                                                                                                            // 159
    throw new Error('Error in Rethink-Meteor: unexpected changes field: ' + JSON.stringify(change));              // 160
                                                                                                                  // 161
  if (table._lastSynthEvent >= ts) {                                                                              // 162
    Meteor.defer(cb);                                                                                             // 163
    return;                                                                                                       // 164
  }                                                                                                               // 165
                                                                                                                  // 166
  table._synthEventCallbacks.push({                                                                               // 167
    f: cb,                                                                                                        // 168
    ts: ts                                                                                                        // 169
  });                                                                                                             // 170
};                                                                                                                // 171
                                                                                                                  // 172
var observe = function (callbacks) {                                                                              // 173
  var cbs = {                                                                                                     // 174
    added: callbacks.added || function () {},                                                                     // 175
    changed: callbacks.changed || function () {},                                                                 // 176
    removed: callbacks.removed || function () {},                                                                 // 177
    error: callbacks.error || function (err) { throw err; }                                                       // 178
  };                                                                                                              // 179
                                                                                                                  // 180
  var self = this;                                                                                                // 181
                                                                                                                  // 182
  var initValuesFuture = new Future;                                                                              // 183
  var initializing = false;                                                                                       // 184
                                                                                                                  // 185
  var stream = self.changes({ includeStates: true }).run();                                                       // 186
  stream.each(Meteor.bindEnvironment(function (err, notif) {                                                      // 187
    if (err) {                                                                                                    // 188
      if (initValuesFuture.isResolved())                                                                          // 189
        cbs.error(err);                                                                                           // 190
      else                                                                                                        // 191
        initValuesFuture.throw(err);                                                                              // 192
      return;                                                                                                     // 193
    }                                                                                                             // 194
                                                                                                                  // 195
    // handle state changes                                                                                       // 196
    if (notif.state) {                                                                                            // 197
      if (notif.state === 'ready') {                                                                              // 198
        if (initializing) {                                                                                       // 199
          initValuesFuture.return();                                                                              // 200
        } else {                                                                                                  // 201
          initValuesFuture.throw(                                                                                 // 202
            new Error(                                                                                            // 203
              "Currently can only observe point queries and orderBy/limit queries. For example: Table.get(id); Table.orderBy({ index: 'id' }).limit(4)."));
        }                                                                                                         // 205
      } else if (notif.state === 'initializing') {                                                                // 206
        initializing = true;                                                                                      // 207
      }                                                                                                           // 208
      return;                                                                                                     // 209
    }                                                                                                             // 210
                                                                                                                  // 211
    if (notif.old_val === undefined && notif.new_val === null) {                                                  // 212
      // nothing found                                                                                            // 213
      return;                                                                                                     // 214
    }                                                                                                             // 215
                                                                                                                  // 216
    // at this point the notification has two fields: old_val and new_val                                         // 217
                                                                                                                  // 218
    // check for the "special" doc                                                                                // 219
    if (notif.new_val && notif.new_val.id === SYNTH_EVENT_ID) {                                                   // 220
      var ts = notif.new_val.ts;                                                                                  // 221
      var q = self._table._synthEventCallbacks;                                                                   // 222
      while (q.length > 0 && q[0].ts <= ts) {                                                                     // 223
        var front = q.shift();                                                                                    // 224
        Meteor.defer(front.f);                                                                                    // 225
      }                                                                                                           // 226
      self._table._lastSynthEvent = ts;                                                                           // 227
      return;                                                                                                     // 228
    }                                                                                                             // 229
                                                                                                                  // 230
    // it is a regular doc, push an event for it                                                                  // 231
    if (! notif.old_val) {                                                                                        // 232
      cbs.added(notif.new_val);                                                                                   // 233
      return;                                                                                                     // 234
    }                                                                                                             // 235
    if (! notif.new_val) {                                                                                        // 236
      cbs.removed(notif.old_val);                                                                                 // 237
      return;                                                                                                     // 238
    }                                                                                                             // 239
    cbs.changed(notif.new_val, notif.old_val);                                                                    // 240
  }));                                                                                                            // 241
                                                                                                                  // 242
  initValuesFuture.wait();                                                                                        // 243
                                                                                                                  // 244
  return {                                                                                                        // 245
    stop: function () {                                                                                           // 246
      wait(stream.close());                                                                                       // 247
    }                                                                                                             // 248
  };                                                                                                              // 249
};                                                                                                                // 250
attachCursorMethod('observe', function () {                                                                       // 251
  return observe;                                                                                                 // 252
});                                                                                                               // 253
                                                                                                                  // 254
Rethink.Table.prototype._publishCursor = function (sub) {                                                         // 255
  var self = this;                                                                                                // 256
  return self.filter({})._publishCursor(sub);                                                                     // 257
};                                                                                                                // 258
                                                                                                                  // 259
attachCursorMethod('_publishCursor', function () {                                                                // 260
  return function (sub) {                                                                                         // 261
    var self = this;                                                                                              // 262
                                                                                                                  // 263
    try {                                                                                                         // 264
      Rethink.Table._publishCursor(self, sub, self._table.name);                                                  // 265
    } catch (err) {                                                                                               // 266
      sub.error(err);                                                                                             // 267
    }                                                                                                             // 268
  };                                                                                                              // 269
});                                                                                                               // 270
                                                                                                                  // 271
                                                                                                                  // 272
Rethink.Table._publishCursor = function (cursor, sub, tableName) {                                                // 273
  var observeHandle = cursor.observe({                                                                            // 274
    added: function (doc) {                                                                                       // 275
      sub.added(tableName, doc.id, doc);                                                                          // 276
    },                                                                                                            // 277
    changed: function (newDoc, oldDoc) {                                                                          // 278
      var fields = diffObject(oldDoc, newDoc);                                                                    // 279
      sub.changed(tableName, newDoc.id, fields);                                                                  // 280
    },                                                                                                            // 281
    removed: function (doc) {                                                                                     // 282
      sub.removed(tableName, doc.id);                                                                             // 283
    }                                                                                                             // 284
  });                                                                                                             // 285
                                                                                                                  // 286
  // We don't call sub.ready() here: it gets called in livedata_server, after                                     // 287
  // possibly calling _publishCursor on multiple returned cursors.                                                // 288
                                                                                                                  // 289
  // register stop callback (expects lambda w/ no args).                                                          // 290
  sub.onStop(function () {                                                                                        // 291
    observeHandle.stop();                                                                                         // 292
  });                                                                                                             // 293
};                                                                                                                // 294
                                                                                                                  // 295
function diffObject (oldDoc, newDoc) {                                                                            // 296
  var diff = {};                                                                                                  // 297
  Object.keys(newDoc).forEach(function (property) {                                                               // 298
    if (! EJSON.equals(oldDoc[property], newDoc[property]))                                                       // 299
      diff[property] = newDoc[property];                                                                          // 300
  });                                                                                                             // 301
  Object.keys(oldDoc).forEach(function (property) {                                                               // 302
    if (! newDoc.hasOwnProperty(property))                                                                        // 303
      diff[property] = undefined;                                                                                 // 304
  });                                                                                                             // 305
                                                                                                                  // 306
  return diff;                                                                                                    // 307
}                                                                                                                 // 308
                                                                                                                  // 309
function wait (promise, after) {                                                                                  // 310
  var f = new Future;                                                                                             // 311
  promise.then(Meteor.bindEnvironment(function (res) {                                                            // 312
    f.return(res);                                                                                                // 313
  }), Meteor.bindEnvironment(function (err) {                                                                     // 314
    f.throw(err);                                                                                                 // 315
  }));                                                                                                            // 316
                                                                                                                  // 317
  var res = f.wait();                                                                                             // 318
  if (after)                                                                                                      // 319
    after();                                                                                                      // 320
  return res;                                                                                                     // 321
}                                                                                                                 // 322
                                                                                                                  // 323
                                                                                                                  // 324
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['simple:rethink'] = {}, {
  Rethink: Rethink
});

})();
