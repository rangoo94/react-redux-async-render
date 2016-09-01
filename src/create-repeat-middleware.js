/**
 * Middleware factory to queue actions in Node.js
 *
 * @param {string} key Key used in actions for async actions
 * @returns {function} Redux middleware with some additional properties
 */
export default function createRepeatMiddleware({ key = 'repeat' } = {}) {
  let queue = []
  let middleware

  if (typeof window !== 'undefined') {
    // If it's browser just pass to next middleware
    middleware = x => next => next
  } else {
    middleware = function repeatMiddleware() {
      return next => action => {
        if (action[key]) {
          queue.push(action)
        }

        next(action)
      }
    }
  }

  /**
   * @returns {object[]} queued actions; new instance for encapsulation (partial - you can, but SHOULDN'T modify actions)
   */
  middleware.getQueue = () => [].concat(queue)

  /**
   * Clear queue
   */
  middleware.clear = () => {
    queue = []
  }

  return middleware
}
