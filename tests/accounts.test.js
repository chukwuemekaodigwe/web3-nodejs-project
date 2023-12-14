
// Mock JWT verification for authenticated requests
jest.mock('../routes/routes.js', () => ({
    ...jest.requireActual('../routes/routes.js'),
    verifyJWT: jest.fn().mockReturnValue((req, res, next) => {
        req.user_id = 1
        next()
    })
}))


const request = require('supertest');
const app = require('../app');

// Mocking the UserModel to control its behavior in tests
const UserModule = jest.createMockFromModule('../models/user.model.js')

UserModule.getcoindetail = jest.fn(result => ['BTC', 'ETH', 'LTC'])
  
  // Mock the AccountModel
  jest.mock('../models/account.model', () => {
    const originalModule = jest.requireActual('../models/account.model');
    return {
      ...originalModule,
     // getUserBalBasedOnToken: jest.fn(),
    };
  });

  

describe('Account Controller Tests', () => {
    beforeAll(async () => {
        // const response = await request(app).post('/api/fakeJWT');

        // token = response.body.token;
        // //        console.log({'token': token})

        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9kaWd3ZUB5YWhvby5jb20iLCJpZCI6MSwiYm5iX2FkZHJlc3MiOm51bGwsInJlZmVycmFsX2NvZGUiOiJYNTRFMDJZNDEiLCJpYXQiOjE3MDI0Nzg3MTMsImV4cCI6MTcwMjU2NTExM30.2YrrpVibhy3UINr18GfMJxB2puEXhYJgL-e_NYZSv0o'
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should only allow authenticated users to access the routes', async () => {
        await request(app).get('/api/accountbal/eth')
        .then(response=>expect(response.status).toBe(403))
    });

    it('Should respond with 403 status code if not authenticated', async () => {
        await request(app).get('/api/accountbal/eth')
        .then(response=> expect(response.status).toBe(403))
       
    });

    it('Should return Ethereum balance for the authenticated user', async () => {
        await request(app).get('/api/accountbal/eth').set('Authorization', token)
            .then((response) => {
            
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                // Add more assertions based on the expected response structure
            })
    });

    it('Should be coin agnostic and return balance for any supported coin type', async () => {
        await request(app).get('/api/accountbal/type/BTC').set('Authorization', token)
            .then((response) => {
          
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                // Add more assertions based on the expected response structure
            })

    });

    it('Should return "record not found" with status code 404 for unsupported coin', async () => {
        await request(app).get('/api/accountbal/type/INVALID_COIN').set('Authorization', token)
        .then((response)=>{
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            // Add more assertions based on the expected response structure
        })
        
    });

    it('Should return 500 status code if the token parameter is not provided', async () => {
        await request(app).get('/api/accountbal/type/').set('Authorization', token)
        .then(response => expect(response.status).toBe(500))
        
        // Add more assertions based on the expected response structure
        
    });
});

