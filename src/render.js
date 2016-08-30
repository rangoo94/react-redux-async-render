import { renderToString } from 'react-dom/server'
import * as c from './constants'

export default function render(callback, { store, asyncMiddleware, repeatMiddleware, createVirtualDom, tries = 1 } = {}) {
  if (!store || typeof store.getState !== 'function') {
    throw new TypeError('You need to pass store to function.')
  }

  if (asyncMiddleware && (typeof asyncMiddleware !== 'function' || typeof asyncMiddleware.clear !== 'function' || typeof asyncMiddleware.getStatus !== 'function')) {
    throw new TypeError('You need to pass correct asyncMiddleware to function.')
  }

  if (repeatMiddleware && (typeof repeatMiddleware !== 'function' || typeof repeatMiddleware.clear !== 'function' || typeof repeatMiddleware.getStatus !== 'function')) {
    throw new TypeError('You need to pass correct repeatMiddleware to function.')
  }

  if (typeof createVirtualDom !== 'function') {
    throw new TypeError('You need to pass function to create React Virtual DOM.')
  }

  let result = {}
  let err = null

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

  if (!asyncMiddleware || asyncMiddleware.getStatus() === c.IDLE || !tries) {
    return callback(result, err)
  }

  const unregister = asyncMiddleware.onIdle(() => {
    result = buildResult()

    if (!result.html) {
      unregister()
      callback(result, err)
    }

    tries--

    if (asyncMiddleware.getStatus() === c.IDLE || !tries) {
      unregister()
      callback(result, err)
    }
  })
}
