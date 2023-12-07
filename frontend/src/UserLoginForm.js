import React, { useState, useContext } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { MethodContext, DataContext } from "./Context";

function UserLoginForm() {
    const {login} = useContext(MethodContext)
    const {user} = useContext(DataContext)
    const INITIAL_STATE = {
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: ''
      };

    const [formData, setFormData] = useState(INITIAL_STATE);
    const history = useHistory()
    
    function handleChange(evt){
        const { name, value } = evt.target;
        setFormData(fData => ({
          ...fData,
          [name]: value
        }));
    };

    function handleSubmit(evt){
        evt.preventDefault();
        login({...formData});
        setFormData(INITIAL_STATE);
        history.push("/")
    };

    if(user.username){
        return (<Redirect to='/' />)
    } //If user is currently logged in

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input name="username" id="username" onChange={handleChange} type="text"/>
                <br />
                <label htmlFor="password">Password</label>
                <input name="password" id="password" onChange={handleChange} type="password"/>
                <br />
                <button type="submit">Log in</button>
            </form>
        </div>
    )
}

export default UserLoginForm;