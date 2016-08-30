export default function createRepeatMiddleware({ key = 'repeat' } = {}) {
  let queue = []
  let middleware

  if (typeof window !== 'undefined') {
    middleware = x => x
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

  middleware.getQueue = () => [].concat(queue)
  middleware.clear = () => {
    queue = []
  }

  return middleware
}
