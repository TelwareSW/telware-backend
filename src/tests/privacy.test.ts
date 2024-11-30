import request from "supertest"
import app from '@base/app';
import User from '@models/userModel';


// Mocking the User model
jest.mock('@models/userModel');

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('GET /blockedUsers', () => {
    it('should return blocked users for a valid user', async () => {
      // Mocking a valid user and its blocked users
      const mockedUser = {
        id: 'validUserId',
        blockedUsers: [
          { username: 'user1', email: 'user1@example.com' },
          { username: 'user2', email: 'user2@example.com' },
        ],
      };

      // Mocking User.findById and populate
      User.findById = jest.fn().mockResolvedValue(mockedUser);

      const res = await request(app)
        .get('/your-endpoint') // Replace with the actual endpoint for this route
        .set('Authorization', 'Bearer valid_token'); // Add token if required

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.users).toEqual(mockedUser.blockedUsers);
    });

    it('should return error when user is not found', async () => {
      // Mocking User.findById to return null (user not found)
      User.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .get('/your-endpoint')
        .set('Authorization', 'Bearer valid_token');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBe('User not found');
    });
  });
});

describe('POST /block/:id', () => {
  it('should block a user successfully', async () => {
    const targetUserId = 'targetUserId';
    User.findByIdAndUpdate = jest.fn().mockResolvedValue({
      blockedUsers: [targetUserId],
    });

    const res = await request(app)
      .post(`/block/${targetUserId}`)
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.users).toContain(targetUserId);
  });

  it('should return error when user ID is invalid', async () => {
    const invalidUserId = 'invalidId';
    const res = await request(app)
      .post(`/block/${invalidUserId}`)
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid user ID');
  });
});

describe('POST /switchReadRecieptsState', () => {
  it('should switch read receipts state successfully', async () => {
    const mockedUser = {
      id: 'validUserId',
      readReceiptsEnablePrivacy: true, // Initial value
    };

    User.findById = jest.fn().mockResolvedValue(mockedUser);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue({
      readReceiptsEnablePrivacy: false, // Updated value
    });

    const res = await request(app)
      .post('/switch-read-receipts-state')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Read receipts privacy updated successfully');
  });

  it('should return error when user not found', async () => {
    User.findById = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .post('/switch-read-receipts-state')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});
