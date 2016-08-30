import * as c from './constants'

/**
 * Middleware factory to handle async actions
 *
 * @param {string} key Key used in actions for async actions
 * @returns {function} Redux middleware with some additional properties
 */
export default function createAsyncMiddleware({ key = 'async' } = {}) {
  let callbacks = []
  let counter = 0
  let timeout = void 0

  // Extracted method to call all callbacks
  const onIdle = () => callbacks.forEach(callback => callback())

  function asyncMiddleware() {
    return next => action => {
      if (action[key] === c.START) {
        counter++
      } else if (action[key] === c.END) {
        if (counter <= 0) {
          console.error(`Something is wrong with your async actions. Probably FINISH method is called from outside the flow.`)
        }

        // Don't break application even if some FINISH actions were running beside flow is broken
        counter = Math.max(0, counter - 1)
      } else {
        return next(action)
      }

      if (action[key]) {
        clearTimeout(timeout)

        if (!counter) {
          // Queue callbacks in event loop to be sure that no async actions will be called immediately
          timeout = setTimeout(onIdle, 1)
        }
      }

      next(action)
    }
  }

  const isWorking = asyncMiddleware.isWorking = () => counter > 0

  /**
   * Add listener for `idle` state
   *
   * @param {function} clbk
   * @returns {function}
   */
  asyncMiddleware.onIdle = clbk => {
    const f = () => clbk()
    callbacks.push(f)

    // Run callback immediately if there is no async actions, otherwise it will be called in standard flow
    if (!isWorking()) {
      clbk()
    }

    return () => {
      let index = callbacks.indexOf(f)

      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Clear everything and remove references
  asyncMiddleware.clear = () => {
    clearTimeout(timeout)
    callbacks = []
    counter = 0
  }

  return asyncMiddleware
}
