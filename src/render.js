import { renderToString } from 'react-dom/server'

/**
 * Prepare ready data to show page to user
 *
 * @param {function({ html, actions, state }, err)} callback  Called after render, with HTML, Redux store state and queued actions
 * @param {object} store  Redux store
 * @param asyncMiddleware
 * @param [repeatMiddleware]
 * @param createVirtualDom  Method which will return virtual DOM passed to render function
 * @param [tries]  Max. number of render retries (when async actions are dispatched again after render)
 */
export default function render(callback, { store, asyncMiddleware, repeatMiddleware, createVirtualDom, tries = 1 } = {}) {
  if (!store || typeof store.getState !== 'function') {
    throw new TypeError('You need to pass store to function.')
  }

  if (asyncMiddleware && (typeof asyncMiddleware !== 'function' || typeof asyncMiddleware.clear !== 'function' || typeof asyncMiddleware.isWorking !== 'function')) {
    throw new TypeError('You need to pass correct asyncMiddleware to function.')
  }

  if (repeatMiddleware && (typeof repeatMiddleware !== 'function' || typeof repeatMiddleware.clear !== 'function')) {
    throw new TypeError('You need to pass correct repeatMiddleware to function.')
  }

  if (typeof createVirtualDom !== 'function') {
    throw new TypeError('You need to pass function to create React Virtual DOM.')
  }

  let result = {}
  let err = null

  /**
   * Build new render result.
   * It caches error, to be sure that even if something will break, user will get previous version
   *
   * @returns {object}
   */
  function buildResult() {
    try {
      result.html = renderToString(createVirtualDom())
      result.state = store.getState()
      result.actions = repeatMiddleware ? repeatMiddleware.getQueue() : []
    } catch (e) {
      err = e
    }

    return result
  }

  result = buildResult()

  // Run callback immediately if there is no need for async actions
  if (!asyncMiddleware || !asyncMiddleware.isWorking() || !tries) {
    return callback(result, err)
  }

  // Keep `unregister` to clean all possible references
  const unregister = asyncMiddleware.onIdle(() => {
    result = buildResult()

    // If there is no HTML something has broken before any render
    if (!result.html) {
      unregister()
      callback(result, err)
    }

    tries--

    if (!asyncMiddleware.isWorking() || !tries) {
      unregister()
      callback(result, err)
    }
  })
}
