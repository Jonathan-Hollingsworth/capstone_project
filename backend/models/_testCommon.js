const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testItemIds = []
const testCartIds = []

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM items");

  const resultsItems = await db.query(`
    INSERT INTO items (name, value, in_stock)
    VALUES ('Item1', '7.50', TRUE),
           ('Item2', '70', TRUE),
           ('Item3', '25', FALSE)
    RETURNING id`);
  testItemIds.splice(0, 0, ...resultsItems.rows.map(r => r.id));

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

  const resultsCarts = await db.query(`
    INSERT INTO carts (owner, title, in_use)
    VALUES ('u1', 'c1', TRUE),
           ('u2', 'c2', TRUE)
    RETURNING id`);
    testCartIds.splice(0, 0, ...resultsCarts.rows.map(r => r.id));
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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testItemIds,
  testCartIds
};