import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MethodContext, DataContext } from "./Context";

function AddToCartForm({itemId}) {
    const {addToCart} = useContext(MethodContext)
    const {user} = useContext(DataContext)
    const INITIAL_STATE = {
        cartId: user.carts[0].id,
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
    };

    function handleSubmit(evt){
        evt.preventDefault();
        addToCart(formData.cartId, itemId, formData.amount);
        setFormData(INITIAL_STATE);
        history.push("/items")
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="cartId">Which Cart?</label>
                <select name="cartId" id="cartId" onChange={handleChange}>
                    <option value={0}>Please choose a Cart</option>
                    {user.carts.map(cart => (
                        <option key={cart.id} value={cart.id}>{cart.title}</option>
                    ))}
                </select>
                <br />
                <label htmlFor="amount">How many?</label>
                <input name="amount" id="amount" onChange={handleChange} type="number"/>
                <br />
                <button type="submit">Add to Cart</button>
            </form>
        </div>
    )
}

export default AddToCartForm;