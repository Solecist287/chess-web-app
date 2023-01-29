import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import App from './components/App/App';
import Game from './components/Game/Game';

const BASE_URL = `${process.env.PUBLIC_URL}`;
console.log(BASE_URL)
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/game',
    element: <Game /> 
  }
], { basename: '/' });

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <RouterProvider router={router} />
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
