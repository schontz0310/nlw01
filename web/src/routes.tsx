import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'

import Home from './pages/home'
import Creatpoint from './pages/CreatePoint'

const Routes = () => {
  return(
    <BrowserRouter>
      <Route component={Home} path='/' exact />
      <Route component={Creatpoint} path='/create-point' />
    </BrowserRouter>
  )
}
export default Routes