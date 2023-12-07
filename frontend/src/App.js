import React, {useState, useEffect} from "react";
import { jwtDecode } from "jwt-decode";
import ShoplyApi from "./api";
import useLocalStorage from "./Hooks";
import Routes from './Routes';
import {DataContext, MethodContext} from "./Context";
import NavBar from "./NavBar";
import "./App.css"

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [user, setUser] = useState({})
  const initialToken = localStorage.token ? localStorage.token : ''
  const [localUserToken, setLocalUserToken] = useLocalStorage('token', initialToken)
    
  useEffect(() => {
      async function getData() {
        let items = await ShoplyApi.getItems()
        setItems(items)
        setIsLoading(false);
        if (localStorage.token) {
          ShoplyApi.token = localStorage.token
          const decoded = jwtDecode(localStorage.token)
          const username = decoded.username
          const user = await ShoplyApi.getUser(username)
          const wishlist = await ShoplyApi.viewList(username)
          setUser(user)
          setWishlist(wishlist)
          if (!user.carts[0]) {
            const newCart = await ShoplyApi.makeCart(username, "My Cart")
            user.carts.push({id: newCart.id, title: newCart.title})
          } //Make a new cart for user if user has none
        }
      }
      getData();
    }, []);
    
  useEffect(() => {
      async function decodeToken() {
        if (localStorage.token) {
          const decoded = jwtDecode(localStorage.token)
          const username = decoded.username
          ShoplyApi.token = localStorage.token
          const user = await ShoplyApi.getUser(username)
          setUser(user)
          if (!user.carts[0]) {
            const newCart = await ShoplyApi.makeCart(username, "My Cart")
            user.carts.push({id: newCart.id, title: newCart.title})
          }
          setIsLoading(false)
        } else {
          setUser({})
          setIsLoading(false)
        }
      }
      decodeToken();
    }, [localUserToken]);

  if (isLoading) {
    return <h1>Loading &hellip;</h1>;
  }

  /** Call the api to register as a new user */
  async function register({username, password, firstName, lastName, email}) {
    const token = await ShoplyApi.signup(username, password, firstName, lastName, email)
    ShoplyApi.token = token
    setLocalUserToken(token)
    setIsLoading(true);
  }

  /** Call the api to log in as a user */
  async function login({username, password}) {
    const token = await ShoplyApi.login(username, password)
    ShoplyApi.token = token
    setLocalUserToken(token)
    setIsLoading(true);
  }

  /** log out of the front-end application */
  function logout() {
    ShoplyApi.token = ''
    setLocalUserToken('')
    setIsLoading(true);
  }

  /** Call the api to update a user */
  async function updateUser(username, {password, firstName, lastName, email}) {
    const carts = user.carts
    const updatedUser = await ShoplyApi.updateUser(username, password, firstName, lastName, email)
    updatedUser.carts = carts
    setUser(updatedUser)
  }


  /** Call the api to create a new cart */
  async function newCart(owner, title){
    const newCart = await ShoplyApi.makeCart(owner, title)
    user.carts.push({id: newCart.id, title: newCart.title}) //Update front-end user
  }

  /** Call the api to rename a cart*/
  async function renameCart(id, title){
    ShoplyApi.renameCart(id ,title)
    for (const cart of user.carts) {
      if (id === cart.id) cart.title = title
    } //Update front-end user
  }

  /** Call the api to add to an item a wishlist */
  async function wishlistItem(username, itemId){
    await ShoplyApi.wishlist(username, itemId)
    const wishlist = await ShoplyApi.viewList(username)
    setWishlist(wishlist) //Update front-end wishlist
  }

  /** Call the api to remove an item from a wishlist */
  async function unlist(username, itemId){
    await ShoplyApi.unlist(username, itemId)
    const wishlist = await ShoplyApi.viewList(username)
    setWishlist(wishlist) //Update front-end wishlist
  }

  /** Call the api to add an item to a cart */
  async function addToCart(cartId, itemId, amount){
    await ShoplyApi.addToCart(cartId, itemId, amount)
  }

  /** Call the api to remove an item from a cart */
  async function removeFromCart(cartId, itemId){
    await ShoplyApi.removeFromCart(cartId, itemId)
  }

  /** Call the api to update the amount of an item in a cart */
  async function updateAmountInCart(cartId, itemId, amount){
    await ShoplyApi.updateAmountInCart(cartId, itemId, amount)
  }

  /** Call the api to proceed to checkout for a cart */
  async function checkout(cartId){
    await ShoplyApi.checkout(cartId)
    for (let i = 0; i < user.carts.length; i++) {
      if (Number(cartId) === user.carts[i].id) {
        user.carts.splice(i, 1)
      } //Update front-end carts
    }
    if (!user.carts[0]) {
      const newCart = await ShoplyApi.makeCart(user.username, "My Cart")
      user.carts.push({id: newCart.id, title: newCart.title})
    }
    console.log(user.carts)
  }

  return (
    <div className="App">
      <DataContext.Provider value={{items, wishlist, user}}>
        <MethodContext.Provider value={{
            register, login, logout, updateUser, newCart, renameCart, wishlistItem, 
            unlist, addToCart, removeFromCart, updateAmountInCart, checkout}}>
          <NavBar />
          <Routes />
        </MethodContext.Provider>
      </DataContext.Provider>
    </div>
  );
}

export default App;