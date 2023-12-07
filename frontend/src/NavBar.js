import React, { useContext } from "react";
import { NavLink, useHistory } from 'react-router-dom'
import {DataContext, MethodContext} from "./Context";
import "./NavBar.css"

function NavBar() {

    const {user} = useContext(DataContext)
    const {logout} = useContext(MethodContext)
    const history = useHistory()

    if(!user.username) {
        return (
            <div className="navbar">
                <NavLink exact to='/'>Home</NavLink>
                <NavLink to='/signup'>Signup</NavLink>
                <NavLink to='/login'>Login</NavLink>
            </div>
        )
    } //If user is currently not logged in

    function handleLogout(evt) {
        evt.preventDefault();
        logout()
        history.push('/')
    }


    return (
        <div className="navbar">
            <NavLink exact to='/'><b>Home</b></NavLink>
            <NavLink to='/items'><b>Items</b></NavLink>
            <NavLink to='/cart'><b>Your Carts</b></NavLink>
            <NavLink to='/checkout'><b>Checkout</b></NavLink>
            <NavLink to='/profile'><b>Profile</b></NavLink>
            <NavLink className='logout' exact to='/logout' onClick={handleLogout}>
                <b>Logout</b>
            </NavLink>
        </div>
    )
}

export default NavBar;