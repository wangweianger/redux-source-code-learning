import "babel-polyfill";

import { createStore } from './redux'

const ADD_TODO = 'ADD_TODO'
let currentValue

/*

    创建一个 Redux store 来以存放应用中所有的 state。

    主要暴露出来的方法
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    

 */

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([ action.text ])
    default:
      return state
  }
}

let store = createStore(todos, [ 'Use Redux' ])


function select(state) {
  return state
}

function handleChange() {
  let previousValue = currentValue
  currentValue = select(store.getState())

  if (previousValue !== currentValue) {
    console.log('Some deep nested property changed from', previousValue, 'to', currentValue)
  }
}

// 返回
let unsubscribe = store.subscribe(handleChange)

let actions = store.dispatch({
  type: 'ADD_TODO',
  text: 'Read the docs'
})


// console.log(store.getState())







