import React from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App'; 
import {createStore} from 'redux'; // get createstore method so we can make a reduxstore
import {Provider} from 'react-redux'; // get the provider componebt to wrap around the who;le app
import rootReducer from './redux-elements/reducers/rootReducer';

const theStore = createStore(rootReducer);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <Provider store = {theStore}>
    <App />
 </Provider>
);
 