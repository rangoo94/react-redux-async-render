/**
 * Middleware factory for ignoring actions server-side
 * Remember to use it before other middlewares or after repeatMiddleware!
 *
 * @param {string} key Key used in actions for actions ignored in Node.js
 * @returns {function} Redux middleware
 */
export default function createIgnoreNodeMiddleware({ key = 'clientOnly' } = {}) {
  if (typeof window !== 'undefined') {
    // When it's browser just pass action to next middleware
    return x => x
  } else {
    return function ignoreNodeMiddleware() {
      return next => action => {
        if (!action[key]) {
          next(action)
        }
      }
    }
  }
}
