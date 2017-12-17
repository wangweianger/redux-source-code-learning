import "babel-polyfill";

import thunk from 'redux-thunk'
import { createStore,applyMiddleware } from './redux'


console.log('----------------------applyMiddleware-------------------------')

const ADD_TODO = 'ADD_TODO'

function reducers(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([ action.text ])
    default:
      return state
  }
}

// 创建 Redux 的 store 对象
const store = createStore(
    reducers,
    applyMiddleware(thunk)
)

console.log(store.getState())

/*
来看看 redux-thunk 的源码 非常简洁

function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;
export default thunk;


从源码中可以看出 thunk 最终的值为 这个function
({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };


//用通俗的代码重写
function (opt) {
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

//---------------------------------------------------------
此时进入 applyMiddleware.js
//--------------------------------------------------------- 

*/


//---------------------------------------------------------
//欢迎回到 mean-alpplyMiddleware.js
//---------------------------------------------------------

//依据以上的分析我们来定义一个异步的 action
function actions(){
    return (dispatch)=>{    
        dispatch({
                type: ADD_TODO,
                text: 'Read the docs'
            })
    }
}

//使用redux-think处理之后的dispatch触发actions
store.dispatch(actions())

/* 分析
先拿出处理之后的dispatch返回函数 
let CCC = function (action) {
    if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument);
    }
    return store.dispatch(action);
};

当调用actions()之后我们可以明显的看出 typeof action === 'function' 为真
因此走的这句代码，再去触发reducers函数从而改变唯一的store状态数据
return action(dispatch, getState, extraArgument);

经过以上的分析就能很好的理解alpplyMiddleware这个方法的作用，主要就是使用第三方库从新实现dispatch方法

*/


//查看数据的变化
console.log(store.getState())

