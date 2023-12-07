import React, {useContext} from "react";
import {useHistory} from "react-router-dom"
import { DataContext, MethodContext } from "./Context";
import AddToCartForm from "./AddToCartForm";
import UpdateAmountForm from "./UpdateAmountForm";
import "./Card.css"

function ItemCard({item, cart}) {
    const {user, wishlist} = useContext(DataContext)
    const {wishlistItem, unlist, removeFromCart} = useContext(MethodContext)
    const history = useHistory()

    async function handleWishlist() {
        await wishlistItem(user.username, item.id)
        history.push("/items")
    }

    async function handleUnlist() {
        await unlist(user.username, item.id)
        history.push("/items")
    }

    async function handleRemove() {
        await removeFromCart(cart.id, item.id)
        history.push("/carts")
    }

    if (cart) {
        return (
            <div className="card">
                    <b>{item.name}</b>
                    <br />
                    <i>Cost: ${item.value}</i>
                    <br />
                    <i>Amount in Cart: {item.amount}</i>
                    <br />
                    <button onClick={handleRemove}>Remove from Cart</button>
                    <br />
                    <UpdateAmountForm item={item} cartId={cart.id} />
            </div>
        )
    }

    for (const wishlisted of wishlist) {
        if (wishlisted.id === item.id) {
            if (!item.inStock) {
                return (
                    <div className="card">
                            <b>{item.name}</b>
                            <br />
                            <i>In Your Wishlist</i>
                            <br />
                            <i>Cost: ${item.value}</i>
                            <br />
                            <button onClick={handleUnlist}>Unlist</button>
                            <br />
                            <b>This item is currently not in stock</b>
                    </div>
                )
            }
            return (
                <div className="card">
                        <b>{item.name}</b>
                        <br />
                        <i>In Your Wishlist</i>
                        <br />
                        <i>Cost: ${item.value}</i>
                        <br />
                        <button onClick={handleUnlist}>Unlist</button>
                        <br />
                        <AddToCartForm itemId={item.id} />
                </div>
            )
        }
    }

    if (!item.inStock) {
        return (
            <div className="card">
                    <b>{item.name}</b>
                    <br />
                    <i>Cost: ${item.value}</i>
                    <br />
                    <button onClick={handleWishlist}>Wishlist</button>
                    <br />
                    <b>This item is currently not in stock</b>
            </div>
        )
    }

    return (
        <div className="card">
                <b>{item.name}</b>
                <br />
                <i>Cost: ${item.value}</i>
                <br />
                <button onClick={handleWishlist}>Wishlist</button>
                <br />
                <AddToCartForm itemId={item.id} />
        </div>
    )
}

export default ItemCard;