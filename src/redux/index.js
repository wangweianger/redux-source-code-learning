import "babel-polyfill";

/*
index.js 主要作用就是导出   
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose

  这几个方法 
 */


import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import warning from './utils/warning'


/* 检查是否是生产环境 如果文件被缩小了但是 NODE_ENV !== 'production' 的话，给用户一个警告
    使用 loose-envify for browserify   https://github.com/zertosh/loose-envify
    或者 DefinePlugin for webpack      http://stackoverflow.com/questions/3003003

* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning(
    'You are currently using minified code outside of NODE_ENV === \'production\'. ' +
    'This means that you are running a slower development build of Redux. ' +
    'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
    'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' +
    'to ensure you have the correct code for your production build.'
  )
}

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose
}
