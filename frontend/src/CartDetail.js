import React, { useState, useContext, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { DataContext } from "./Context";
import ShoplyApi from "./api";
import ItemCard from "./ItemCard";
import NewCartForm from "./NewCartForm";
import RenameCartForm from "./RenameCartForm";

function Checkout() {
    const {user} = useContext(DataContext)
    const INITIAL_STATE = {
        cartId: user.carts ? user.carts[0].id : 1 //prevents errors
      };

    const [formData, setFormData] = useState(INITIAL_STATE);
    const [currentCart, setCurrentCart] = useState({items: []});

    useEffect(() => {
        async function getCart() {
          let cart = await ShoplyApi.getCart(formData.cartId)
          setCurrentCart(cart)
        }
        getCart();
      }, [formData]);
    
    async function handleChange(evt){
        const { name, value } = evt.target;
        setFormData(fData => ({
          ...fData,
          [name]: value
        }));
    };

    if (!user.username) {
      return (<Redirect to='/' />)
    }

    return (
        <div>
            <NewCartForm />
            <hr />
            <label htmlFor="cartId">Which Cart?</label>
            <select name="cartId" id="cartId" onChange={handleChange}>
                <option value={0}>Please choose a Cart</option>
                {user.carts.map(cart => (
                    <option key={cart.id} value={cart.id}>{cart.title}</option>
                ))}
            </select>
            {currentCart.items.map(item => (
                <ItemCard key={item.id} item={item} cart={currentCart}/>
            ))}
            <hr />
            <RenameCartForm cart={currentCart} />
        </div>
    )
}

export default Checkout;