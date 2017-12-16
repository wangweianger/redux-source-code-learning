import "babel-polyfill";

import { compose } from './redux'


// compose 就是一个工具函数 
/* 看看官方定义 
从右到左来组合多个函数。这是函数式编程中的方法，为了方便，被放到了 Redux 里。 当需要把多个 store 增强器 依次执行的时候，需要用到它。
    参数
    (arguments): 需要合成的多个函数。每个函数都接收一个函数作为参数，然后返回一个函数。

    返回值
    (Function): 从右到左把接收到的函数合成后的最终函数。

    官方案例：
    使用compose函数 
        finalCreateStore = compose(
        applyMiddleware(...middleware),
        require('redux-devtools').devTools(),
        require('redux-devtools').persistState(
          window.location.href.match(/[?&]debug_session=([^&]+)\b/)
        ),
        createStore
    )

    不使用 compose 来写是这样子：
    finalCreateStore = applyMiddleware(middleware) 
    (   
        devTools()
        ( 
            persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
            ( 
                createStore 
            )
        )
    )

    -------------------------------------
    好好看看使用与不使用compose函数写法上的区别
    -------------------------------------

    参考文档 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce_clone
    再去看看文档中 Array 对象的 reduce 方法使用

    回头再来看看 compose.js 的代码

*/










