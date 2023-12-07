import React, { useState, useContext, useEffect } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { MethodContext, DataContext } from "./Context";
import ShoplyApi from "./api";
import "./CartSelect.css"

function Checkout() {
    const {checkout} = useContext(MethodContext)
    const {user} = useContext(DataContext)
    const INITIAL_STATE = {
        cartId: user.carts ? user.carts[0].id : 1 //prevents errors
      };

    const [formData, setFormData] = useState(INITIAL_STATE);
    const [currentCart, setCurrentCart] = useState({items: []});
    const history = useHistory()

    let total = 0
    currentCart.items.map(item => (total += (Number(item.value) * item.amount)))

    useEffect(() => {
        async function getCart() {
          let cart = await ShoplyApi.getCart(formData.cartId)
          setCurrentCart(cart)
        }
        getCart();
      }, [formData]);

    if (!user.username) {
      return (<Redirect to='/' />)
    }
    
    async function handleChange(evt){
        const { name, value } = evt.target;
        setFormData(fData => ({
          ...fData,
          [name]: value
        }));
        const cart = await ShoplyApi.getCart(formData.cartId)
        setCurrentCart(cart)
    };

    function handleSubmit(evt){
        evt.preventDefault();
        checkout(formData.cartId);
        setFormData(INITIAL_STATE);
        history.push('/')
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="cartId">Which Cart?</label>
                <select name="cartId" id="cartId" onChange={handleChange}>
                    {user.carts.map(cart => (
                        <option key={cart.id} value={cart.id}>{cart.title}</option>
                    ))}
                </select>
                {currentCart.items.map(item => (
                    <>
                      <p>{item.name}: ${item.value} x {item.amount}</p>
                      <br />
                    </>
                ))}
                <br />
                <b>Total Value ${total}</b>
                <br />
                <button type="submit">Checkout</button>
            </form>
        </div>
    )
}

export default Checkout;