-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'test@systemtest.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin',
        'admin@systemtest.com',
        TRUE);

INSERT INTO carts (owner, title)
VALUES ('testuser', 'Test Cart'), ('testadmin', 'Admin Cart');

INSERT INTO items (name, value, in_stock)
VALUES ('Test Item', 3.20, TRUE), ('Unstocked Item', 0.00, FALSE),
       ('Pricey Item', 70.50, TRUE);