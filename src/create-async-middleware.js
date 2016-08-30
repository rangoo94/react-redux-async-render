import * as c from './constants'

export default function createAsyncMiddleware({ key = 'async' } = {}) {
  let callbacks = []
  let counter = 0
  let timeout = void 0
  let status = c.IDLE

  const onIdle = () => callbacks.forEach(callback => callback())

  function asyncMiddleware() {
    return next => action => {
      if (action[key] === c.START) {
        counter++
      } else if (action[key] === c.END) {
        if (counter <= 0) {
          console.error(`Something is wrong with your async actions. Probably FINISH method is called from outside the flow.`)
        }

        counter = Math.max(0, counter - 1)
      } else {
        return next(action)
      }

      status = counter > 0 ? c.WORKING : c.IDLE

      if (action[key]) {
        clearTimeout(timeout)

        if (!counter) {
          timeout = setTimeout(onIdle, 1)
        }
      }

      next(action)
    }
  }

  asyncMiddleware.getStatus = () => status

  asyncMiddleware.onIdle = clbk => {
    const f = () => clbk()
    callbacks.push(f)

    if (status === c.IDLE) {
      clbk()
    }

    return () => {
      let index = callbacks.indexOf(f)

      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  asyncMiddleware.clear = () => {
    clearTimeout(timeout)
    callbacks = []
    counter = 0
    status = c.IDLE
  }

  return asyncMiddleware
}
