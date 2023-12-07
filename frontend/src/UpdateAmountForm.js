import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MethodContext } from "./Context";

function UpdateAmountForm({item, cartId}) {
    const {updateAmountInCart} = useContext(MethodContext)
    const INITIAL_STATE = {
        amount: 0
      };

    const [formData, setFormData] = useState(INITIAL_STATE);
    const history = useHistory()
    
    function handleChange(evt){
        const { name, value } = evt.target;
        setFormData(fData => ({
          ...fData,
          [name]: value
        }));
        console.log(formData)
        console.log(item)
    };

    function handleSubmit(evt){
        evt.preventDefault();
        updateAmountInCart(cartId, item.id, formData.amount);
        setFormData(INITIAL_STATE);
        history.push("/cart")
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="amount">Change Amount?</label>
                <input name="amount" id="amount" onChange={handleChange} type="number"/>
                <br />
                <button type="submit">Update</button>
            </form>
        </div>
    )
}

export default UpdateAmountForm;