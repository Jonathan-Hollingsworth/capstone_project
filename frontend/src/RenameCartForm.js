import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MethodContext } from "./Context";

function RenameCartForm({cart}) {
    const {renameCart} = useContext(MethodContext)
    const INITIAL_STATE = {
        title: cart.title
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
        renameCart(cart.id, formData.title);
        setFormData(INITIAL_STATE);
        history.push("/")
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <b>Rename Cart?</b>
                <br />
                <label htmlFor="title">Title</label>
                <input name="title" id="title" onChange={handleChange} type="text"/>
                <br />
                <button type="submit">Rename</button>
            </form>
        </div>
    )
}

export default RenameCartForm;