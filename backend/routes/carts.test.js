"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testItemIds,
  testCartIds,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /carts */

describe("POST /carts", function () {
  test("creates cart as intended", async function () {
    const resp = await request(app)
        .post(`/carts`)
        .send({
          owner: "admin",
          title: "test"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      cart: {
        id: expect.any(Number),
        owner: "admin",
        title: "test",
        inUse: true
      },
    });
  });

  test("overwrites owner", async function () {
    const resp = await request(app)
        .post(`/carts`)
        .send({
          owner: "admin",
          title: "test"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      cart: {
        id: expect.any(Number),
        owner: "u1",
        title: "test",
        inUse: true
      },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/carts`)
        .send({})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/carts`)
        .send({
          owner: "u1",
          title: 0
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /jobs */

describe("GET /carts", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/carts`);
    expect(resp.body).toEqual({
          carts: [
            {
              id: expect.any(Number),
              owner: "u1",
              title: "c1",
              inUse: true
            },
            {
              id: expect.any(Number),
              owner: "u2",
              title: "c2",
              inUse: true
            },
          ],
        },
    );
  });
});

/************************************** GET /carts/:id */

describe("GET /carts/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/carts/${testCartIds[0]}`);
    expect(resp.body).toEqual({
      cart: {
        id: testCartIds[0],
        owner: "u1",
        title: "c1",
        inUse: true,
        items: [
          {
            id: testItemIds[0],
            name: "Item1",
            value: "7.5",
            amount: 1
          }
        ]
      },
    });
  });

  test("not found for no such cart", async function () {
    const resp = await request(app).get(`/carts/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /carts/:id */

describe("PATCH /carts/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}`)
        .send({
          title: "C-New",
          inUse: false
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      cart: {
        id: expect.any(Number),
        owner: "u1",
        title: "C-New",
        inUse: false,
      },
    });
  });

  test("works for owner of cart", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}`)
        .send({
          title: "C-New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      cart: {
        id: expect.any(Number),
        owner: "u1",
        title: "C-New",
        inUse: true,
      },
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}`)
        .send({
          name: "C-New",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such cart", async function () {
    const resp = await request(app)
        .patch(`/carts/0`)
        .send({
          title: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}`)
        .send({
          id: 0,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}`)
        .send({
          title: 0,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /carts/:id */

describe("DELETE /carts/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testCartIds[0] });
  });

  test("works for owner of cart", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: testCartIds[0] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such cart", async function () {
    const resp = await request(app)
        .delete(`/carts/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** POST /carts/:cartId/items/:itemId */

describe("POST /carts/:cartId/items/:itemId", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[0]}/items/${testItemIds[1]}`)
        .send({amount: 1})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      cart: {
        cartId: testCartIds[0],
        itemId: testItemIds[1],
        amount: 1,
        totalVal: "70"
      }
    });
  });

  test("works for owner of cart", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[0]}/items/${testItemIds[1]}`)
        .send({amount: 1})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      cart: {
        cartId: testCartIds[0],
        itemId: testItemIds[1],
        amount: 1,
        totalVal: "70"
      }
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}/items/${testItemIds[1]}`)
        .send({amount: 1})
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}/items/${testItemIds[1]}`)
        .send({amount: 1});
        
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such cart", async function () {
    const resp = await request(app)
        .patch(`/carts/0/items/${testItemIds[1]}`)
        .send({amount: 1})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /carts/:cartId/items/:itemId */

describe("PATCH /carts/:cartId/items/:itemId", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`)
        .send({amount: 5})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      relation: {
        cartId: testCartIds[0],
        itemId: testItemIds[0],
        amount: 5,
        totalVal: "37.5"
      }
    });
  });

  test("works for owner of cart", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`)
        .send({amount: 5})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      relation: {
        cartId: testCartIds[0],
        itemId: testItemIds[0],
        amount: 5,
        totalVal: "37.5"
      }
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`)
        .send({amount: 5})
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`)
        .send({amount: 5});
        
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such cart", async function () {
    const resp = await request(app)
        .patch(`/carts/0/items/${testItemIds[0]}`)
        .send({amount: 5})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found for item not in cart", async function () {
    const resp = await request(app)
        .patch(`/carts/${testCartIds[0]}/items/${testItemIds[1]}`)
        .send({amount: 5})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** DELETE /carts/:cartId/items/:itemId */

describe("DELETE /carts/:cartId/items/:itemId", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      deleted: {
        cartId: testCartIds[0],
        itemId: testItemIds[0]
      }
    });
  });

  test("works for owner of cart", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      deleted: {
        cartId: testCartIds[0],
        itemId: testItemIds[0]
      }
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}/items/${testItemIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such cart", async function () {
    const resp = await request(app)
        .delete(`/carts/0/items/${testItemIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found for item not in cart", async function () {
    const resp = await request(app)
        .delete(`/carts/${testCartIds[0]}/items/${testItemIds[1]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** POST /carts/:cartId/checkout */

describe("POST /carts/:cartId/checkout", function () {
  test("works for admin: with items", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[0]}/checkout`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      cart: {
        cartId: testCartIds[0],
        totalVal: "7.5"
      }
    });
  });

  test("works for owner of cart: with items", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[0]}/checkout`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      cart: {
        cartId: testCartIds[0],
        totalVal: "7.5"
      }
    });
  });

  test("works for admin: empty", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[1]}/checkout`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      cart: {
        cartId: testCartIds[1],
        totalVal: "0"
      }
    });
  });

  test("works for owner of cart: empty", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[1]}/checkout`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      cart: {
        cartId: testCartIds[1],
        totalVal: "0"
      }
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[0]}/checkout`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post(`/carts/${testCartIds[0]}/checkout`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such cart", async function () {
    const resp = await request(app)
        .post(`/carts/0/checkout`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request for cart not in use", async function () {
    await request(app)
        .post(`/carts/${testCartIds[0]}/checkout`)
        .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .post(`/carts/${testCartIds[0]}/checkout`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});