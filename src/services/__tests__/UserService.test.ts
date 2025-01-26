import { UserService } from '../UserService';
import User from '../../models/User';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../models/User');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return paginated users with default parameters', async () => {
      const mockUsers = [{ id: '1', name: 'Test User' }];
      const mockCount = 1;

      (User.countDocuments as jest.Mock).mockResolvedValue(mockCount);
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockUsers),
          }),
        }),
      });

      const result = await userService.getUsers({});

      expect(result).toEqual({
        total: mockCount,
        limit: 10,
        page: 1,
        sortBy: 'createdAt',
        items: mockUsers,
      });
    });

    it('should apply search filters correctly', async () => {
      const searchParams = {
        gender: 'male',
        'address.country': 'USA',
      };

      await userService.getUsers({ search: searchParams });

      expect(User.find).toHaveBeenCalledWith({
        gender: 'male',
        'address.country': 'USA',
      });
    });
  });

  describe('fetchUsers', () => {
    it('should process user batches correctly', async () => {
      const mockApiResponse = {
        data: {
          results: [
            {
              login: { uuid: '1' },
              gender: 'male',
              name: { first: 'John', last: 'Doe' },
              location: {
                city: 'Test City',
                state: 'Test State',
                country: 'Test Country',
                street: { number: 123, name: 'Test St' },
              },
              email: 'test@example.com',
              dob: { age: 30 },
              picture: { large: 'test.jpg' },
            },
          ],
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockApiResponse);

      await userService.fetchUsers();

      expect(axios.get).toHaveBeenCalled();
    });
  });
});
