import "babel-polyfill";

import { createStore,combineReducers } from './redux'

console.log('----------------------combineReducers-------------------------')

const ADD_SOME_OME = 'ADD_SOME_OME'
const GET_CART_NUMBER = 'GET_CART_NUMBER'

const initialStateHome = {
    home:10,
    cart:20
}

function home (state = initialStateHome, action) {
    switch (action.type) {
    case ADD_SOME_OME:
        return { ...state, home: action.number }  
    default:
        return state
    }
}

function cart (state = initialStateHome, action) {
    switch (action.type) {
    case GET_CART_NUMBER:
        return { ...state, cart: action.number }  
    default:
        return state
    }
}

const reducers = combineReducers({
    home,
    cart,
})

console.log(reducers)

let store = createStore(reducers,initialStateHome)


let actions = store.dispatch({
  type: 'ADD_SOME_OME',
  number: 50
})

console.log(store.getState())



