import React from 'react'
import {Route, Redirect, Switch} from 'react-router-dom'
import Checkout from './Checkout'
import CartDetail from './CartDetail'
import ItemList from './ItemList'
import UserSignupForm from './UserSignupForm'
import UserLoginForm from './UserLoginForm'
import Profile from './Profile'
import Home from './Home'

function Routes() {
    return(
        <Switch>
            <Route exact path='/cart'><CartDetail /></Route>
            <Route exact path='/checkout'><Checkout /></Route>
            <Route exact path='/items'><ItemList /></Route>
            <Route exact path='/profile'><Profile /></Route>
            <Route exact path='/login'><UserLoginForm /></Route>
            <Route exact path='/signup'><UserSignupForm /></Route>
            <Route exact path='/'><Home /></Route>
            <Redirect to='/'/>
        </Switch>
    )
}

export default Routes