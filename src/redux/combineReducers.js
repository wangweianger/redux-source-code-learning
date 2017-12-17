import "babel-polyfill";

import { ActionTypes } from './createStore'
import isPlainObject from 'lodash/isPlainObject'
import warning from './utils/warning'


//获得不知道的 State 错误信息  打印 actionName 
function getUndefinedStateErrorMessage(key, action) {
  const actionType = action && action.type
  const actionName = (actionType && `"${actionType.toString()}"`) || 'an action'

  return (
    `Given action ${actionName}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  )
}

//整个函数的作用就是根据不同的状态输出一些提示信息
function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
    //记录传入的 reducers key
  const reducerKeys = Object.keys(reducers)
  //如果action为真并且 action.type === ActionTypes.INIT
  const argumentName = action && action.type === ActionTypes.INIT ?
    //preloadedstate参数传递给CreateStore
    'preloadedState argument passed to createStore' :
    //收到以前的state状态
    'previous state received by the reducer'

    //如果reducers不为真 抛出 信息 确认argument参数
  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }

  //如果传入的state不是object 这抛出 argument to be an object 的信息
  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }
  /*
  检测 inputState的key 中如果出现了 reducers中没有的key 则标记 unexpectedKeys[key]=true
   */
  //!unexpectedKeyCache[key] 一直为 true
  const unexpectedKeys = Object.keys(inputState).filter(key =>
    !reducers.hasOwnProperty(key) &&
    !unexpectedKeyCache[key]
  )
  //如果unexpectedKeys 值为真 遍历 并给 unexpectedKeyCache赋值  不是生产环境时unexpectedKeyCache默认值为{}
  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })

  //如果unexpectedKeys 的length为真 这抛出 意外的key值，相应的key讲被忽略掉
  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}

function assertReducerShape(reducers) {
    //遍历reducers
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]
    //传入 undefined 和 { type: ActionTypes.INIT } 两个参数 检测返回值是否为underfined
    //此处在案例中可以理解为 function home (undefined, { type: ActionTypes.INIT }) {...}
    //去看看返回值是否是underfined
    const initialState = reducer(undefined, { type: ActionTypes.INIT })
    //如果值为underfined给出error提示 是否有返回默认的state 
    //建议返回initial state, 如果不想返回值，你可以返回一个null值
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the reducer is undefined, you must ` +
        `explicitly return the initial state. The initial state may ` +
        `not be undefined. If you don't want to set a value for this reducer, ` +
        `you can use null instead of undefined.`
      )
    }
    /*
    当用随机类型探测时返回underfined
    不要用任何以 "redux/*" 为命名空间的 actions key,他们被认为是私有的
    相反，如果有任何未知的actions,你应该返回最近的state,不管action type是什么
    初始状态可能不能是underfined,但可以是null
     */
    const type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.')
    if (typeof reducer(undefined, { type }) === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
        `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
        `namespace. They are considered private. Instead, you must return the ` +
        `current state for any unknown actions, unless it is undefined, ` +
        `in which case you must return the initial state, regardless of the ` +
        `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */

/*
  combineReducers 辅助函数的作用是，把一个由多个不同 reducer 函数作为 value 的 object，合并成一个最终的 reducer 函数，然后就可以对这个 reducer 调用 createStore
  合并后的格式为json 大致结构为
  {
      reducer1: ...
      reducer2: ...
  }
 */
export default function combineReducers(reducers) {
     // 传入的reducers 为一个object  遍历object的可以存储  到 reducerKeys 变量中
     // 体现在案例中值为 { home:function home(){...} , cart:function cart(){...} }
  const reducerKeys = Object.keys(reducers)
  // reducers 的中value值为funciton组时组成的json
  // 运行之后体现在案例中的值为 { home:function home(){...}, cart:function cart(){...} }
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== 'production') {
        //如果是 production 环境  reducers[key]的值为 undefined 就给出警告信息

      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }
    //当 reducers[key] 为function 时才给 finalReducers赋值
    if (typeof reducers[key] === 'function') {
        //体现在案例中运行完之后 finalReducers 的值为 { home:function home(){...}, cart:function cart(){...} }
      finalReducers[key] = reducers[key]
    }
  }
  //finalReducers 中key值集合   相对于reducerKeys的区别在于去掉了value值不为function类型的key值
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    //不是 production 环境时定义为空对象
    unexpectedKeyCache = {}
  }
  /*
  此处检测传入的reducers 如果没有匹配到相应的type 是否有返回默认的state 
  建议返回initial state, 如果不想返回值，你可以返回一个null值
   */
  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    // 如果报错记录报错信息
    shapeAssertionError = e
  }

  // 最终返回 combination 这个function 
  return function combination(state = {}, action) {
    //如果检测传入的reducers有错误 则抛出错误信息
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    //如果不是 production 环境
    if (process.env.NODE_ENV !== 'production') {
        //若 warningMessage 的值为真，则返回一列的警告信息
      const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache)
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    //核心代码  合并state
    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      //上此对应key 的state值
      const previousStateForKey = state[key]
      //调用reducer 之后返回的state值
      const nextStateForKey = reducer(previousStateForKey, action)
      //如果返回值为underfined 者抛出错误信息
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      //合并state
      nextState[key] = nextStateForKey
      //判断state值是否改变
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    //判断state值是否改变 若改变者用新的 state值即： nextState ，  如果没有改变则返回传入的 state值
    return hasChanged ? nextState : state
  }
}
