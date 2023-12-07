import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MethodContext, DataContext } from "./Context";

function NewCartForm() {
    const {newCart} = useContext(MethodContext)
    const {user} = useContext(DataContext)
    const INITIAL_STATE = {
        title: ''
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
        newCart(user.username, formData.title);
        setFormData(INITIAL_STATE);
        history.push("/")
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <b>Make a New Cart?</b>
                <br />
                <label htmlFor="title">Title</label>
                <input name="title" id="title" onChange={handleChange} type="text"/>
                <br />
                <button type="submit">New Cart</button>
            </form>
        </div>
    )
}

export default NewCartForm;