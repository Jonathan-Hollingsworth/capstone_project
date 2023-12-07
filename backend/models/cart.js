"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

/** Related functions for carts. */

class Cart {
  /** Create cart with data.
   * 
   * data should be {owner, title}
   *
   * Returns { id, owner, title, inUse }
   **/

  static async create(data) {
    const result = await db.query(
        `INSERT INTO carts (owner, title)
         VALUES ($1, $2)
         RETURNING id, owner, title, in_use AS "inUse"`, [data.owner, data.title]);

  return result.rows[0];
  }

  /** Find all carts.
   *
   * Returns [{ id, owner, title, inUse }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT id, owner, title, in_use AS "inUse"
           FROM carts
           ORDER BY owner`);

    return result.rows;
  }

  /** Given an id, return data about cart.
   *
   * Returns { id, owner, title, inUse, items }
   *   where items is [{id, name, value, amount}, ...]
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(id) {
    const cartRes = await db.query(
          `SELECT id, owner, title, in_use AS "inUse"
           FROM carts
           WHERE id = $1`, [id]);

    const cart = cartRes.rows[0];

    if (!cart) throw new NotFoundError(`No cart: ${id}`);

    const cartItemsRes = await db.query(
          `SELECT i.id, i.name, i.value, ci.amount
           FROM items AS i
           LEFT JOIN carts_items AS ci ON i.id = ci.item_id
           WHERE ci.cart_id = $1`, [id]);

    cart.items = cartItemsRes.rows
    return cart;
  }

  /** Update cart data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, inUse }
   *
   * Returns { id, owner, title, inUse }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          inUse: "in_use",
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE carts 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                                owner,
                                title,
                                in_use AS "inUse"`;
    const result = await db.query(querySql, [...values, id]);
    const cart = result.rows[0];

    if (!cart) throw new NotFoundError(`No cart: ${id}`);

    return cart;
  }

  /** Delete given cart from database; returns undefined. */

  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM carts
           WHERE id = $1
           RETURNING id`, [id]);
    const cart = result.rows[0];

    if (!cart) throw new NotFoundError(`No cart: ${id}`);
  }

  /** Add an item to a given cart; returns new relation. */

  static async addItem(cartId, itemId, amount) {
    const itemCheck = await db.query(
      `SELECT id, value, in_stock AS "inStock"
       FROM items
       WHERE id = $1`, [itemId]);
    const item = itemCheck.rows[0];

    if (!item) throw new NotFoundError(`No item: ${itemId}`);
    if (!item.inStock) throw new BadRequestError(`Out of stock: ${itemId}`);

    const cartCheck = await db.query(
      `SELECT id
       FROM carts
       WHERE id = $1`, [cartId]);
    const cart = cartCheck.rows[0];

    if (!cart) throw new NotFoundError(`No cart: ${cartId}`);

    const relation = await db.query(
          `INSERT INTO carts_items (cart_id, item_id, amount, total_val)
           VALUES ($1, $2, $3, $4)
           RETURNING cart_id AS "cartId", item_id AS "itemId", amount, total_val AS "totalVal"`,
        [cartId, itemId, amount, item.value * amount]);

    return relation.rows[0]
  }

  /** Remove an item from a given cart; returns removed relation. */

  static async removeItem(cartId, itemId) {
    const res = await db.query(
      `DELETE FROM carts_items
       WHERE cart_id = $1 AND item_id = $2
       RETURNING cart_id AS "cartId", item_id AS "itemId"`, [cartId, itemId]);
    const relation = res.rows[0];

    if (!relation) throw new NotFoundError(`No relation: ${cartId}-${itemId}`);

    return relation
  }

  /** Change the amount of an item in a given cart; returns relation. */

  static async changeItemAmount(cartId, itemId, amount) {
    const itemCheck = await db.query(
      `SELECT id, value, in_stock AS "inStock"
       FROM items
       WHERE id = $1`, [itemId]);
    const item = itemCheck.rows[0];

    const res = await db.query(
      `UPDATE carts_items SET amount = $1, total_val = $2
       WHERE cart_id = $3 AND item_id = $4
       RETURNING cart_id AS "cartId", item_id AS "itemId", amount, total_val AS "totalVal"`,
       [amount, item.value * amount, cartId, itemId]);
    const relation = res.rows[0];

    if (!relation) throw new NotFoundError(`No relation: ${cartId}-${itemId}`);

    return relation
  }

  /** Add an item to a given cart; returns undefined. */

  static async checkout(cartId) {
    const cartCheck = await db.query(
      `SELECT id, in_use AS "inUse"
       FROM carts
       WHERE id = $1`, [cartId]);
    const cart = cartCheck.rows[0];

    if (!cart) throw new NotFoundError(`No cart: ${cartId}`);
    if (!cart.inUse) throw new BadRequestError(`Cart not in use: ${cartId}`);

    let total = 0

    const cartValsRes = await db.query(
      `SELECT total_val AS "totalVal"
       FROM carts_items
       WHERE cart_id = $1`, [cartId]);

    const vals = cartValsRes.rows

    for (const val of vals) {
      total += Number(val.totalVal)
    }

    const receipt = await db.query(
          `INSERT INTO purchases (cart_id, total_val)
           VALUES ($1, $2)
           RETURNING cart_id AS "cartId", total_val AS "totalVal"`,
        [cartId, total]);

    await db.query(
      `UPDATE carts SET in_use = FALSE
       WHERE id = $1`,
    [cartId]);

    return receipt.rows[0]
  }
}


module.exports = Cart;