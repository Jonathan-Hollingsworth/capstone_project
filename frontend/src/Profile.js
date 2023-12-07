import React, {useContext, useState} from "react";
import {useHistory, Redirect} from "react-router-dom"
import { DataContext, MethodContext } from "./Context";

function Profile() {
    const {user} = useContext(DataContext)
    const {updateUser} = useContext(MethodContext)
    const {username, firstName, lastName, email} = user

    const INITIAL_STATE = {
        password: '',
        firstName,
        lastName,
        email
      };

    const [formData, setFormData] = useState(INITIAL_STATE);
    const history = useHistory()

    if (!user.username) {
        return (<Redirect to='/' />)
    }
    
    function handleChange(evt){
        const { name, value } = evt.target;
        setFormData(fData => ({
          ...fData,
          [name]: value
        }));
    };

    async function handleSubmit(evt){
        evt.preventDefault();
        updateUser(username, {...formData})
        setFormData(INITIAL_STATE);
        history.push("/")
    };

    return (
        <div>
            <h1>{username}</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="password">Password</label>
                <input name="password" id="password" onChange={handleChange} type="password"/>
                <br />
                <label htmlFor="firstName">First Name</label>
                <input name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} type="text"/>
                <br />
                <label htmlFor="lastName">Last Name</label>
                <input name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} type="text"/>
                <br />
                <label htmlFor="email">E-Mail Address</label>
                <input name="email" id="email" value={formData.email} onChange={handleChange} type="email"/>
                <br />
                <button type="submit">Update</button>
            </form>
        </div>
    )
}

export default Profile