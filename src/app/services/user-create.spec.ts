import { UserCreateService } from './user-create';
import { UserSignupResponse } from '../models/user-signup-response.model';
import { of } from 'rxjs';

describe('UserCreateService (Jest)', () => {
  let service: UserCreateService;
  let httpClientMock: { post: jest.Mock; get: jest.Mock };

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
    };

    service = new UserCreateService(httpClientMock as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should post FormData and return UserSignupResponse', (done) => {
      const mockFormData = new FormData();
      mockFormData.append('firstName', 'John');

      const mockResponse: UserSignupResponse = {
        status: 'SUCCESS',
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        nickname: 'johndoe',
        email: 'john@example.com',
        createdAt: '2026-01-26T00:00:00Z',
      };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.create(mockFormData).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(httpClientMock.post).toHaveBeenCalledWith(
          'http://localhost:8000/api/user/create',
          mockFormData,
        );
        done();
      });
    });
  });

  describe('checkNicknameExists', () => {
    it('should return true if nickname exists', (done) => {
      const nickname = 'johndoe';
      const mockRes = { exists: true };

      httpClientMock.get.mockReturnValue(of(mockRes));

      service.checkNicknameExists(nickname).subscribe((res) => {
        expect(res).toBe(true);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `http://localhost:8000/api/users/nickname-exists?nick=${nickname}`,
        );
        done();
      });
    });

    it('should return false if nickname does not exist', (done) => {
      const nickname = 'janedoe';
      const mockRes = { exists: false };

      httpClientMock.get.mockReturnValue(of(mockRes));

      service.checkNicknameExists(nickname).subscribe((res) => {
        expect(res).toBe(false);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `http://localhost:8000/api/users/nickname-exists?nick=${nickname}`,
        );
        done();
      });
    });
  });
});
