import "babel-polyfill";

import { createStore,bindActionCreators } from './redux'

console.log('----------------------bindActionCreators-------------------------')

const ADD_TODO = 'ADD_TODO'

function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text:'Add Something one'
  };
}
function addTodoTwo(text) {
  return {
    type: 'ADD_TODO',
    text:'Add Something two'
  };
}

let actions = {
    addTodo:addTodo,
    addTodoTwo:addTodoTwo
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([ action.text ])
    default:
      return state
  }
}

let store = createStore(todos, [ 'Use Redux' ])


let boundActionCreators = bindActionCreators(actions, store.dispatch);

//boundActionCreators 传递给子组件调用，子组件不需要引入dispatch 直接调用即可
//子组件直接调用
boundActionCreators.addTodo()
console.log(store.getState())

boundActionCreators.addTodoTwo()
console.log(store.getState())


