'use strict'
module.exports = Scope;

var _ = require('lodash');

function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
}

function initWatchVal() {}

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
  if (valueEq) {
    return _.isEqual(newValue, oldValue);
  }
  else {
    return newValue === oldValue || 
      (typeof newValue === 'number' && typeof oldValue === 'number' && isNaN(newValue) && isNaN(oldValue));
  }
}

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
  var self = this;
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() {},
    valueEq: !!valueEq,
    last: initWatchVal
  };
  this.$$watchers.unshift(watcher);
  this.$$lastDirtyWatch = null;
  return function() {
    var index = self.$$watchers.indexOf(watcher);
    if (index >= 0) {
      self.$$watchers.splice(index, 1);
      self.$$lastDirtyWatch = null;
    }
  }
}

Scope.prototype.$$digestOnce = function() {
  var self = this;
  var newValue, oldValue, dirty;
  _.forEachRight(this.$$watchers, function(watcher) {
    if (watcher) {
      try {
        newValue = watcher.watchFn(self);
        oldValue = watcher.last;
        if (!self.$$areEqual(newValue, oldValue, watcher.valueEq)) {
          watcher.last = (watcher.valueEq ? _.cloneDeep(newValue): newValue);
          self.$$lastDirtyWatch = watcher;
          watcher.listenerFn(newValue, 
            (oldValue === initWatchVal ? newValue : oldValue),
            self);
          dirty = true;
        }
        else if (self.$$lastDirtyWatch === watcher) {
          return false;
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
  return dirty;
}

Scope.prototype.$digest = function() {
  var dirty;
  var ttl = 10;
  do {
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) {
      throw '10 digest iterations reached'
    }
  } while(dirty);
}
