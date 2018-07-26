const log = require('debug')('bono:middlewares:json');

module.exports = ({ debug = false } = {}) => {
  function marshallErr (err) {
    let { message, status } = err;
    let field;
    if (err.field) {
      field = err.field.name;
    }
    let error = { message, field, status };
    if (debug) {
      error.stack = err.stack;
    }
    return error;
  }

  return async (ctx, next) => {
    try {
      await next();

      if (ctx.status >= 400) {
        let { status, message } = ctx;
        ctx.body = ctx.body || { errors: [ { message, status } ] };
        ctx.status = status;
      } else if (ctx.state.result) {
        ctx.body = ctx.state.result;
      }
    } catch (err) {
      ctx.status = err.status = err.status || 500;
      ctx.lastError = err;

      if (ctx.status >= 500) {
        log(`Caught error with stack => ${err.stack}`);
      }

      let errors = [];
      if (err.children) {
        errors = err.children.map(childErr => marshallErr(childErr));
      } else {
        errors.push(marshallErr(err));
      }

      ctx.body = { errors };
    }
  };
};
