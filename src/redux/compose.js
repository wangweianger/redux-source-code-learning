import "babel-polyfill";

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */


/*
    上面的英文文档是最好的案例诠释
    例如： compose(f, g, h) 最终的结果为  f(g(h(...args)))
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

//步骤分析
/*
    compose(
        applyMiddleware,
        devTools,
        persistState,
        createStore
    )
1.第一次运行后
    a 为:
    functin(){
        return applyMiddleware(devTools(...args))
    }
    b 为:  devTools
    把b作为参数传给a

2.第二次运行
    a 为：
    functon(){
        return  applyMiddleware(devTools(...args))( persistState(...args) )
    }
    
    b 为:  persistState

3.第三次运行
    a 为：
    functon(){
        return  applyMiddleware(devTools(...args))( persistState(...args) )( createStore(...args) )
    }
    b 为： createStore

    可以看见最终返回一个函数：    
    applyMiddleware( devTools(...args) ) (  persistState(...args) ) (  createStore(...args) )
    
 */


/*--------用通俗的方式写上面的代码---------------*/
function copycompose() {
    var funcs = [];
    for(var i=0;i<arguments.length;i++){
        funcs[i]=arguments[i]
    }
    // 如果 参数为0个直接返回 function
    if (funcs.length === 0) {
        return function(arg){
            return arg
        }
    }
    //参数为一个 直接返回 这个参数
    if (funcs.length === 1) {
        return funcs[0]
    }

    // 重中之中就在这里 好好去理解
    return funcs.reduce(function(a, b){
        return function(){
            return a(b.apply(undefined, arguments));
        }
    })
}









