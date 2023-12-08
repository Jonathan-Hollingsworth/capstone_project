# Shoply (capstone_project)

This full-stack application is meant to replicate the functionality of an online store.

### Urls:

- [Frontend](https://shoply-project.surge.sh/)
- [Backend](https://shoply-backend-ijah.onrender.com)

### Functionality:

- Signup/Login
- Adding/Removing items to carts
- Adding new items (Backend Only)
  - You will want to go to `/auth/token` with `{"username": "testadmin", "password": "********"}` in the request body
  - You will recieve a token that you must add to your request header like so `Authorization: "Bearer {token}"`
  - Make a post request to `/items` with your item in the request body (`{name, value, inStock}`)
- Updating user data
- Creating additional carts
- Renaming your carts
- Mock checkout
- Wishlisting items

### Tests:

- Backend: Tests are in the same folder as the item they are testing (Run with `npm test` or `jest -i --DetectOpenHandles`)
- Frontend: I currently do not have the time or experience to properly write tests for the frontend of this application (They would have been ran with `npm test` or `react-scripts test`)
> Make sure you download the dependencies with `npm install`

### API:

The API was created by doing the following:
1. Creating a database for everything to be stored
   - Creating tables within that database to store each individule piece (Including relations)
2. Seeding basic test data within the database
3. Create endpoints
   - Make sure to create an end point that would allow data to be added to the database
4. Allow frontend to connect with API/Backend
> You can see the Schema that was used [here](https://drawsql.app/teams/empty-team/diagrams/shoply)

### User Flow:

The standard user flow is as follows:
1. Signup/Login
2. Look through items and do one of two things:
   - Add the item to a cart
   - Add the item the their wishlist
3. Create/Edit carts is needed/desired
4. Take cart and proceed to cheeckout
