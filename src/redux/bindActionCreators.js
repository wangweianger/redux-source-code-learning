import "babel-polyfill";

function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args))
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */

/*
作用返回有dispatch的函数或者对象dispatch集合
例如： 
返回function
    (...args) => dispatch(actionCreator(...args))
返回对象dispatch集合：
    {
        a: (...args) => dispatch(actionCreator(...args)) ,
        b:(...args) => dispatch(actionCreator(...args)) 
    }

    因此实现了调用actions时，当前组件可以不用知道是否有redux的存在，不用传dispatch对象
    此函数用的比较少
 */
export default function bindActionCreators(actionCreators, dispatch) {
  //如果是function,则返回dispatch函数，并中断后面的执行
  if (typeof actionCreators === 'function') {
    //中断执行 并返回： (...args) => dispatch(actionCreator(...args)) 函数
    return bindActionCreator(actionCreators, dispatch)
  }

  //如果不为object 或者为 null 则抛出错误
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${actionCreators === null ? 'null' : typeof actionCreators}. ` +
      `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }

  //乳沟传入的参数是object,则遍历key并返回dispatch的函数对象boundActionCreators
  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    //是否是function 才执行
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  //最终返回的是一个对象dispatch  
  /*
    例如：
    { 
        a: (...args) => dispatch(actionCreator(...args)) ,
        b:(...args) => dispatch(actionCreator(...args)) 
    }
   */
  return boundActionCreators
}
