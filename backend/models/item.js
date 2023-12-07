"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {  NotFoundError } = require("../expressError");

/** Related functions for items. */

class Item {
  /** Create item with data.
   * 
   * data should be {name, value}
   *   data can also include {inStock}
   *
   * Returns { id, name, value, inStock }
   **/

  static async create({name, value, inStock=true}) {
    const result = await db.query(
        `INSERT INTO items (name, value, in_stock)
         VALUES ($1, $2, $3)
         RETURNING id, name, value, in_stock AS "inStock"`, [name, value, inStock]);

  return result.rows[0];
  }

  /** Find all items.
   * 
   * searchFilters (all optional):
   * - minValue
   * - maxValue
   * - name (will find case-insensitive, partial matches)
   *
   * Returns [{ id, name, value, inStock }, ...]
   **/

  static async findAll({minValue, maxValue, name} = {}) {
    let query = `SELECT id, name, value, in_stock AS "inStock"
                 FROM items`;

    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (minValue !== undefined) {
      queryValues.push(minValue);
      whereExpressions.push(`value >= $${queryValues.length}`);
    }

    if (maxValue !== undefined) {
      queryValues.push(maxValue);
      whereExpressions.push(`value <= $${queryValues.length}`);
    }

    if (name !== undefined) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY name";
    const result = await db.query(query, queryValues);

    return result.rows;
  }

  /** Given an id, return data about item.
   *
   * Returns { id, name, value, inStock }
   *
   * Throws NotFoundError if item not found.
   **/

  static async get(id) {
    const itemRes = await db.query(
          `SELECT id, name, value, in_stock AS "inStock"
           FROM items
           WHERE id = $1`, [id]);

    if (!itemRes.rows[0]) throw new NotFoundError(`No item: ${id}`);

    return itemRes.rows[0];
  }

  /** Update item data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { name, value, inStock }
   *
   * Returns { id, name, value, inStock }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          inStock: "in_stock",
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE items 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                                name,
                                value,
                                in_stock AS "inStock"`;
    const result = await db.query(querySql, [...values, id]);
    const item = result.rows[0];

    if (!item) throw new NotFoundError(`No item: ${id}`);

    return item;
  }

  /** Delete given item from database; returns undefined. */

  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM items
           WHERE id = $1
           RETURNING id`, [id]);
    const item = result.rows[0];

    if (!item) throw new NotFoundError(`No item: ${id}`);
  }
}


module.exports = Item;