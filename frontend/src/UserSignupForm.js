import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MethodContext } from "./Context";

function UserSignupForm() {
    const {register} = useContext(MethodContext)
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
        register({...formData});
        setFormData(INITIAL_STATE);
        history.push("/")
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input name="username" id="username" onChange={handleChange} type="text"/>
                <br />
                <label htmlFor="password">Password</label>
                <input name="password" id="password" onChange={handleChange} type="password"/>
                <br />
                <label htmlFor="firstName">First Name</label>
                <input name="firstName" id="firstName" onChange={handleChange} type="text"/>
                <br />
                <label htmlFor="lastName">Last Name</label>
                <input name="lastName" id="lastName" onChange={handleChange} type="text"/>
                <br />
                <label htmlFor="email">E-Mail Address</label>
                <input name="email" id="email" onChange={handleChange} type="email"/>
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default UserSignupForm;