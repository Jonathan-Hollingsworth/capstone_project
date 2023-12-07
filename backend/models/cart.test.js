"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Cart = require("./cart.js")
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testCartIds,
  testItemIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newCart = {
    owner: "u1",
    title: "New Cart",
  };

  test("works", async function () {
    let cart = await Cart.create(newCart);
    expect(cart).toEqual({
      ...newCart,
      id: expect.any(Number),
      inUse: true
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let carts = await Cart.findAll();
    expect(carts).toEqual([
      {
        id: testCartIds[0],
        owner: "u1",
        title: "c1",
        inUse: true
      },
      {
        id: testCartIds[1],
        owner: "u2",
        title: "c2",
        inUse: true
      }
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let cart = await Cart.get(testCartIds[0]);
    expect(cart).toEqual({
        id: testCartIds[0],
        owner: "u1",
        title: "c1",
        inUse: true,
        items: []
      },);
  });

  test("not found if no such cart", async function () {
    try {
      await Cart.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    title: "New",
    inUse: true,
  };
  test("works", async function () {
    let cart = await Cart.update(testCartIds[0], updateData);
    expect(cart).toEqual({
      id: testCartIds[0],
      owner: "u1",
      ...updateData,
    });
  });

  test("not found if no such cart", async function () {
    try {
      await Cart.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Cart.update(testCartIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Cart.remove(testCartIds[0]);
    const res = await db.query(
        "SELECT id FROM carts WHERE id=$1", [testCartIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such cart", async function () {
    try {
      await Cart.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** addItem */

describe("addItem", function () {
    test("works", async function () {
      const addRes = await Cart.addItem(testCartIds[0], testItemIds[0], 1);
      expect(addRes).toEqual({
        cartId: testCartIds[0],
        itemId: testItemIds[0],
        amount: 1,
        totalVal: expect.any(String)
      });
    });
  
    test("not found if no such cart", async function () {
      try {
        await Cart.addItem(0, testItemIds[0], 1);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });

    test("not found if no such item", async function () {
      try {
        await Cart.addItem(testCartIds[0], 0, 1);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });

    test("bad request with unstocked item", async function () {
      try {
        await Cart.addItem(testCartIds[0], testItemIds[2], 1);
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
});

/************************************** removeItem */

describe("removeItem", function () {
  test("works", async function () {
    await Cart.addItem(testCartIds[0], testItemIds[0], 1);
    await Cart.removeItem(testCartIds[0], testItemIds[0]);
    const res = await db.query(
      `SELECT cart_id, item_id FROM carts_items
       WHERE cart_id=$1 AND item_id=$2`, [testCartIds[0], testItemIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if item not in cart", async function () {
    try {
      await Cart.removeItem(testCartIds[0], testItemIds[0]);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** changeItemAmount */

describe("changeItemAmount", function () {
  test("works", async function () {
    const addRes = await Cart.addItem(testCartIds[0], testItemIds[0], 1);
    expect(addRes).toEqual({
      cartId: testCartIds[0],
      itemId: testItemIds[0],
      amount: 1,
      totalVal: expect.any(String)
    });
    const changeRes = await Cart.changeItemAmount(testCartIds[0], testItemIds[0], 3);
    expect(changeRes).toEqual({
      cartId: testCartIds[0],
      itemId: testItemIds[0],
      amount: 3,
      totalVal: expect.any(String)
    });
  });

  test("not found if item not in cart", async function () {
    try {
      await Cart.changeItemAmount(testCartIds[0], testItemIds[0], 3);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** checkout */

describe("checkout", function () {
  test("works: with items", async function () {
    await Cart.addItem(testCartIds[0], testItemIds[0], 1);
    const checkoutRes = await Cart.checkout(testCartIds[0]);
    expect(checkoutRes).toEqual({
      cartId: testCartIds[0],
      totalVal: expect.any(String)
    });
  });

  test("works: with empty cart", async function () {
    const checkoutRes = await Cart.checkout(testCartIds[0]);
    expect(checkoutRes).toEqual({
      cartId: testCartIds[0],
      totalVal: "0"
    });
  });

  test("not found if no such cart", async function () {
    try {
      await Cart.checkout(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with cart not in use", async function () {
    try {
      await db.query(
        `UPDATE carts SET in_use = FALSE
         WHERE id = $1`, [testCartIds[0]]);
      await Cart.checkout(testCartIds[0]);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});