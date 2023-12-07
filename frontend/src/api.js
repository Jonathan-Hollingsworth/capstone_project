import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class ShoplyApi {
  // the token for interactive with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${ShoplyApi.token}` };
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  /** Create a new cart for current token */

  static async makeCart(owner, title) {
    let res = await this.request(`carts`, {owner, title}, 'post');
    return res.cart;
  }

  /** Get details on a cart by id. */

  static async getCart(id) {
    let res = await this.request(`carts/${id}`);
    return res.cart;
  }

  /** Update the title of a cart by id. */

  static async renameCart(id, title) {
    let res = await this.request(`carts/${id}`, {title}, 'patch');
    return res.cart;
  }

  /** Get details on all carts */

  static async getCarts() {
    let res = await this.request(`carts`);
    return res.carts;
  }

  /** Add a specified amount of an item to a specified cart */

  static async addToCart(cartId, itemId, amount) {
    let res = await this.request(`carts/${cartId}/items/${itemId}`, {amount}, 'post');
    return res.cart;
  }

  /** Update the amount of an item in a specified cart */

  static async updateAmountInCart(cartId, itemId, amount) {
    await this.request(`carts/${cartId}/items/${itemId}`, {amount}, 'patch');
  }

  /** Remove an item from a specified cart */

  static async removeFromCart(cartId, itemId) {
    await this.request(`carts/${cartId}/items/${itemId}`, {}, 'delete');
  }

  /** Imitate the checkout process for a specified cart */

  static async checkout(cartId) {
    await this.request(`carts/${cartId}/checkout`, {}, 'post');
  }

  /** Get details on all items */

  static async getItems() {
    let res = await this.request(`items`);
    return res.items;
  }

  /** Get details on all items that include a specified name */

  static async getItemsByName(name) {
    let res = await this.request(`items`, {name});
    return res.items;
  }

  /** Signup as a new user */

  static async signup(username, password, firstName, lastName, email) {
    const newUserData = {username, password, firstName, lastName, email}
    let res = await this.request(`auth/register`, newUserData, 'post');
    return res.token;
  }

  /** Login as a currently existing user */

  static async login(username, password) {
    let res = await this.request(`auth/token`, {username, password}, 'post');
    return res.token;
  }

  /** Get the data of a currently existing user if authorized */

  static async getUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  /** Update the data of a currently existing user */

  static async updateUser(username, password, firstName, lastName, email) {
    let res = await this.request(`users/${username}`, {password, firstName, lastName, email}, 'patch');
    return res.user;
  }

  /** View the wishlist of a specified user */

  static async viewList(username) {
    let res = await this.request(`users/${username}/wishlist`);
    return res.wishlist;
  }

  /** Add an item to the wishlist of a specified user */

  static async wishlist(username, itemId) {
    let res = await this.request(`users/${username}/wishlist/${itemId}`, {}, 'post');
    return res.wishlisted;
  }

  /** Remove an item from the wishlist of a specified user */

  static async unlist(username, itemId) {
    let res = await this.request(`users/${username}/wishlist/${itemId}`, {}, 'delete');
    return res.unlisted;
  }

}

export default ShoplyApi