import "babel-polyfill";

import compose from './compose'

//---------------------------------------------------------
//需要先看 mean-applyMiddleware.js  若没有请回头看此文件
//---------------------------------------------------------
//
/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
/*
  使用包含自定义功能的 middleware 来扩展 Redux 是一种推荐的方式。Middleware 可以让你包装 store 的 dispatch 方法来达到你想要的目的.
  Middleware 最常见的使用场景是无需引用大量代码或依赖类似 Rx 的第三方库实现异步 actions。这种方式可以让你像 dispatch 一般的 actions 那样 dispatch 异步 actions。
  因此我们拿最常用的 redux-thunk 来解析一下这个函数

  在mean-applyMiddleware.js中分析知道，redux-thunk最终返回的值为,我们把结果赋值给 AAA 方便下面的解说
  let AAA = function (opt) {
        var dispatch = opt.dispatch,
            getState = opt.getState;
        return function (next) {
            return function (action) {
                if (typeof action === 'function') {
                    return action(dispatch, getState, extraArgument);
                }
                return next(action);
            };
        };
    };

*/

export default function applyMiddleware(...middlewares) {
    //返回一个函数 唯一的参数为 createStore，也就是redux中的createStore返回的结果
  return (createStore) => (reducer, preloadedState, enhancer) => {
    //这里相执行了createStore方法 传了3个参数，
    //这三个参数从createStore.js 中的 return enhancer(createStore)(reducer, preloadedState) 得来，可以看出传来的参数只有2个
    //因此也就不会再执行createStore.js中的 enhancer函数
    const store = createStore(reducer, preloadedState, enhancer)
    //这里得到了store,拿取createStore.js 中的dispatch函数 存储在dispatch临时变量中
    let dispatch = store.dispatch
    //因为 ...middlewares 是一个数组，临时存储
    let chain = []

    //包装 getState 和 dispatch 两个方法
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    //循环调用
    //体现在案例中时 middlewares 的值为 [AAA] 因此运行一次
    //返回的chain为 [ AAA(middlewareAPI)  ], 可以看出middlewareAPI值正是AAA函数需要的两个参数
    /*
    体现在案例中此时 chain 值为,我们把返回的function赋值为 BBB 方便下面的解说
    [
        let BBB = function (next) {
            return function (action) {
                if (typeof action === 'function') {
                    return action(dispatch, getState, extraArgument);
                }
                return next(action);
            };
        };
    ]

     */
    chain = middlewares.map(middleware => middleware(middlewareAPI))

    //这段代码运行完之后会得到新的dispatch
    /*
    体现在案例中下面这段代码返回值dispatch为,我们把function赋值为 CCC 方便下面的解说
    let CCC = function (action) {
                if (typeof action === 'function') {
                    return action(dispatch, getState, extraArgument);
                }
                return store.dispatch(action);
            };
    这里的面的 next 值为 store.dispatch        

     */
    dispatch = compose(...chain)(store.dispatch)

    //最终返回新的createStore方法，重写了dispatch,其他的都没有变
    return {
      ...store,
      dispatch
    }
  }
}

//---------------------------------------------------------
// 看完之后 请继续回到 mean-applyMiddleware.js
//---------------------------------------------------------


