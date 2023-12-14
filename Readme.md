## Project Readme

### Overview

This project implements a backend system with a focus on the Model-View-Controller (MVC) architecture. It is an interview assessment in which I'm required to develop two additional routes that will enable clients to access their crypto token balance: one for Ethereum tokens/coins and the other for every other token type. The system provides two additional APIs to enhance user functionality. These APIs are:

1. **Route**: `/api/accountbal/eth`
   - **Description**: Provides the authenticated user with their Ethereum wallet balance.

2. **Route**: `/api/accountbal/type/:token`
   - **Description**: Offers the user the ability to retrieve the balance of any supported cryptocurrency on their account. The `:token` parameter can be any token/coin supported by the software.

### Functionality

#### 1. `/api/accountbal/eth`
   - **Description**: Retrieves the Ethereum account balance of the authenticated user.

#### 2. `/api/accountbal/type/:token`
   - **Description**: Fetches the account balance of the specified cryptocurrency for the authenticated user. The `:token` parameter allows the user to inquire about the balance of any supported cryptocurrency.

### Implementation Details

- **Middleware Usage**: The system employs the `ensureWebToken` middleware to restrict unauthorized route access.

- **Error Handling**: If a user attempts to access the system without proper authentication, they will be denied access. Additionally, if a user requests information on a cryptocurrency not registered in the system, a "record not found" response is provided.

### Usage

#### Prerequisites

Ensure that you have the required dependencies installed by running:

```bash
npm install
```

#### Database and Tables setup
You have the proper database and tables set; 

#### Setup environment 
-- Setup variable appropriately by providing the environment variable on the .env file and additional config.js file
-- then configure the config.js files on the root of this project

#### Running the Server

Start the server using:

```bash
npm run start
```

### Code Testing

I setup test cases using jest frmework to test the routes for some vital features, such as
-- Testing to make sure only autheticated ussers access the system, 
-- Testing the results to make sure they return the right status codes
-- Testing the routes for the appropriate responses/results

To execute the test, run

```
npm run test
```
The test cases are accessed from the tests directory I created  ``` /tests ```

**Author: Odigwe Malachy Chukwuemeka
