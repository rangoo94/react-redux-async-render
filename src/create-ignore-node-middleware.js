export default function createIgnoreNode({ key = 'clientOnly' } = {}) {
  if (typeof window !== 'undefined') {
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
