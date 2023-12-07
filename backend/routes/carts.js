"use strict";

/** Routes for carts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureCartOwnerOrAdmin, ensureLoggedIn } = require("../middleware/auth");
const Cart = require("../models/cart");
const cartNewSchema = require("../schemas/cartNew.json");
const cartUpdateSchema = require("../schemas/cartUpdate.json");

const router = express.Router({ mergeParams: true });


/** POST / { cart } => { cart }
 *
 * cart should be { owner, title }
 *
 * Returns { id, owner, title, inUse }
 *
 * Authorization required: logged in
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  req.body.owner = res.locals.user.username
  try {
    const validator = jsonschema.validate(req.body, cartNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const cart = await Cart.create(req.body);
    return res.status(201).json({ cart });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *   { carts: [ { id, owner, title, inUse }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const carts = await Cart.findAll();
    return res.json({ carts });
  } catch (err) {
    return next(err);
  }
});

/** GET /[cartId] => { cart }
 *
 * Returns { id, owner, title, inUse, items }
 *   where items is [{id, name, value, amount}, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const cart = await Cart.get(req.params.id);
    return res.json({ cart });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[cartId]  { fld1, fld2, ... } => { cart }
 *
 * Data can include: { title, inUse }
 *
 * Returns { id, owner, title, inUse }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureCartOwnerOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, cartUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const cart = await Cart.update(req.params.id, req.body);
    return res.json({ cart });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:id", ensureCartOwnerOrAdmin, async function (req, res, next) {
  try {
    await Cart.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

/** POST /[cartId]/items/[itemId] => { cart }
 * 
 * Make sure you add an `amount` via the request body
 *
 * Returns { cartId, itemId, amount, totalVal }
 *
 * Authorization required: correct user or admin
 */

router.post("/:cartId/items/:itemId", ensureCartOwnerOrAdmin, async function (req, res, next) {
  const {amount} = req.body
  try {
    const cart = await Cart.addItem(req.params.cartId, req.params.itemId, amount);
    return res.json({ cart });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[cartId]/items/[itemId] => { deleted: id }
 * 
 *
 * Authorization required: admin
 */

router.patch("/:cartId/items/:itemId", ensureCartOwnerOrAdmin, async function (req, res, next) {
  const {amount} = req.body
  try {
    const relation = await Cart.changeItemAmount(req.params.cartId, req.params.itemId, amount);
    return res.json({ relation });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[cartId]/items/[itemId] => { deleted: id }
 * 
 *
 * Authorization required: admin
 */

router.delete("/:cartId/items/:itemId", ensureCartOwnerOrAdmin, async function (req, res, next) {
  try {
    const relation = await Cart.removeItem(req.params.cartId, req.params.itemId);
    return res.json({ deleted: relation });
  } catch (err) {
    return next(err);
  }
});

/** POST /[cartId]/checkout => { cart }
 * 
 *
 * Returns { cartId, totalVal }
 *
 * Authorization required: correct user or admin
 */

router.post("/:cartId/checkout", ensureCartOwnerOrAdmin, async function (req, res, next) {
  try {
    const cart = await Cart.checkout(req.params.cartId);
    return res.json({ cart });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;