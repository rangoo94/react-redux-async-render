# React Redux Async Render

It's set of few middlewares and helpers for rendering React/Redux applications with async actions like getting data from API without changing data flow in application.

## Usage

Simply, register `asyncMiddleware`, `repeatMiddleware` or `ignoreNodeMiddleware` to your Redux store.
Using simple `async`, `repeat` and `clientOnly` properties in your actions which goes through Redux store, you can handle how they work.

### Async middleware

It's used to handle if application is in `working` or `idle` state.
When fired action has `async` property set to `start` - async jobs counter is incremented, `end` - decremented.

Best way to get through async actions is to prepare `request` and `finish` action for each of them.

```js
const middleware = createAsyncMiddleware({
  key: 'async'    // Property used to determine if action is async(default: async)
})
```

### Repeat middleware

It's not so common to use. Mainly it's needed when you're subscribing somewhere, e.g by WebSocket. Add `repeat: true` to your action to queue it.

```js
const middleware = createRepeatMiddleware({
  key: 'repeat'    // Property used to determine if action should be repeated client-side (default: repeat)
})
```

### IgnoreNode middleware

It's middleware to prohibit some actions of being dispatched on server-side (e.g. subscribing - combined with *repeat middleware*).
Add `clientOnly: true` to your action to use it. Remember, that it should be added before any other middleware.

```js
const middleware = createIgnoreNodeMiddleware({
  key: 'clientOnly'    // Property used to determine if action should be ignored server-side (default: clientOnly)
})
```

### Render helper

It's combining all of this things together. It needs `react-dom` to be installed.

You have to provide to it callback `({ html, state, actions }, err)` and some options.

```js
render(callback, {
   store: store,            // Redux store
   asyncMiddleware: m1,     // Instance of async middleware 
   repeatMiddleware: m2,    // Instance of repeat middleware
   createVirtualDom: func,  // Method to create virtual DOM to render
   tries: 1                 // Number of tries to render after idle status (default: 1)
})
```

Later you can find some example

## To do

- Add `timeout` option for async render
- Add possibility to override `ReactDOMServer.render` method
- Add examples (+ instructions how to use it in real code)
- Prepare missing unit tests
