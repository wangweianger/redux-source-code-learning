import "babel-polyfill";

import isPlainObject from 'lodash/isPlainObject'
import $$observable from 'symbol-observable'

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
//init actions  初始化时调用一次
export const ActionTypes = {
  INIT: '@@redux/INIT'
}

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function createStore(reducer, preloadedState, enhancer) {
  /*
    判断createStore参数 对参数从新赋值 判断第二个参数是否是函数，第三个参数是否是underfined
   */
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }


  if (typeof enhancer !== 'undefined') {

    if (typeof enhancer !== 'function') {
      //如果 enhancer 为真 但是 不为函数时 直接抛出错误
      throw new Error('Expected the enhancer to be a function.')
    }

    // 如果为真 则中断运行， 并把createStore 作为参数传给enhancer
    // 主要作用是 加入中间件 例如：applyMiddleware
    return enhancer(createStore)(reducer, preloadedState)
  }

  // 如果 reducer 不为函数 直接 报错
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  //把传入的 reducer 作为函数内变量保存起来 。 实质上reducer就是一个函数 ， 例如在案例中体现为：todos 函数
  let currentReducer = reducer

  //闭包内一直存在  体现在调用案例中的话此值为 [ 'Use Redux' ]  
  let currentState = preloadedState

  //用来存储subscribe 方法 订阅的函数
  let currentListeners = []
  let nextListeners = currentListeners
  // 是否调用中
  let isDispatching = false

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  //此方法返回 redux 的唯一state状态值   
  //案例中第一次加载值为 [ 'Use Redux' ]
  function getState() {
    //currentState 是闭包内变量，会一直存在
    return currentState
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  
  /*
    变化监听器 每当调用dispatch action 的时候就会执行
   */
  function subscribe(listener) {
    // 如果listener 不为函数直接抛出错误
    
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    //标识是否移除 默认在 nextListeners 中
    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    //返回移除当前监听的 unsubscribe 函数， 
    //调用者移除当前监听函数 及移除 nextListeners 数组中对应的listener函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  
  /*
    核心函数 dispatch
    唯一能改变 Store 数据的触发函数， 即唯一能够改变内部变量currentState的方式 
   */
  function dispatch(action) {
    //如果action不是Object对象，则抛出错误
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    // action.type 值不为真则抛出错误
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    // Reducers 也许没有派遣的actions，就是Reducers没有匹配到相应的actions函数
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    // 如果抛出错误，这表示Reducers也许没有派遣的actions
    try {
      isDispatching = true
      // 更新唯一状态数currentState 的值   
      /*体现在调用案例中时
        currentState = [ 'Use Redux' ]
        action = { type: 'ADD_TODO', text: 'Read the docs' }
        根据todos函数运行的结果为 
        [ 'Use Redux','Read the docs']
        运行之后 currentState 的值为  [ 'Use Redux','Read the docs']  
        因此调用 store.getState() 方法会返回 [ 'Use Redux','Read the docs'] 
       */
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 触发nextListeners 中的所有监听函数
    // 体现在案例中的话主要作用是监听触发actions前后唯一state数据是否有改变
    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    // 最后返回action   案例：{ type: 'ADD_TODO', text: 'Read the docs' }
    return action 
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    // 不为函数抛出错误
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    //用传入的 nextReducer 替换掉原来的 currentReducer  ， 再初始化一次 
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  //辅助监听方法
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      //observer 不是 object 抛出错误
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  //初始化 dispatch
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
