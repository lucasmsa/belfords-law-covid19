import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Graph from '../pages/Graph'

const Routes: React.FC = () => (
  <Switch>
    <Route path='/' exact component={Home} />
    <Route path='/graph' exact component={Graph} />
  </Switch>
)

export default Routes