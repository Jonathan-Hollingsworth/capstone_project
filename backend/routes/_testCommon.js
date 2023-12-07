"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Cart = require("../models/cart");
const Item = require("../models/item");
const { createToken } = require("../helpers/tokens");

const testCartIds = []
const testItemIds = []

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM items");

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "admin",
    firstName: "AdminF",
    lastName: "AdminL",
    email: "admin@admin.com",
    password: "password3",
    isAdmin: true,
  });

  testCartIds[0] = (await Cart.create({owner: "u1", title: "c1"})).id;
  testCartIds[1] = (await Cart.create({owner: "u2", title: "c2"})).id;

  testItemIds[0] = (await Item.create({name: "Item1", value: 7.50})).id;
  testItemIds[1] = (await Item.create({name: "Item2", value: 70})).id;
  testItemIds[2] = (await Item.create({name: "Item3", value: 25, inStock: false})).id;

  await User.wishlist("u1", testItemIds[0])

  await Cart.addItem(testCartIds[0], testItemIds[0], 1)
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  testCartIds,
  testItemIds
};