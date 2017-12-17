import "babel-polyfill";


var ActionTypes = {
  INIT: '@@redux/INIT'
}

function createStore(reducer, preloadedState, enhancer){
    let currentState = preloadedState
    let currentReducer = reducer
    let nextListeners = []

    function getState(){
        return currentState
    }
    function subscribe(listener){
        nextListeners.push(listener)
        return function unsubscribe() {
            const index = nextListeners.indexOf(listener)
            nextListeners.splice(index, 1)
        }
    }
    function dispatch(action){
        currentState = currentReducer(currentState, action)
        for (let i = 0; i < nextListeners.length; i++) {
            const listener = nextListeners[i]
            listener()
        }
        return action
    }
    function replaceReducer(){}

    dispatch({ type: ActionTypes.INIT })

    return {
        getState,
        subscribe,
        dispatch,
        replaceReducer
    }
}


const ADD_TODO = 'ADD_TODO'
function todos(state = [], action) {
    switch (action.type) {
        case 'ADD_TODO':
            return state.concat([ action.text ])
        default:
            return state
    }
}

let store = createStore(todos,[ 'Use Redux' ])

let currentValue
function handleChange() {
  let previousValue = currentValue
  currentValue = store.getState()
  if (previousValue !== currentValue) {
    console.log('store数据从', previousValue, '变为', currentValue)
  }
}

let unsubscribe = store.subscribe(handleChange)

let actions = store.dispatch({
  type: 'ADD_TODO',
  text: 'Read the docs'
})

// console.log(store.getState())









