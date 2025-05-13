import { transformUsers, GroupedResult } from '../lib/transformUsers';
import { APIUser } from '../lib/fetchUsers';

const mockUsers: APIUser[] = [
  {
    firstName: 'Terry',
    lastName: 'Medhurst',
    gender: 'male',
    age: 50,
    hair: { color: 'Black' },
    company: { department: 'Marketing' },
    address: { postalCode: '12345' },
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    gender: 'female',
    age: 30,
    hair: { color: 'Blond' },
    company: { department: 'Marketing' },
    address: { postalCode: '54321' },
  }
];

test('transformUsers groups and summarizes correctly', () => {
  const grouped: GroupedResult = transformUsers(mockUsers);

  expect(grouped).toHaveProperty('Marketing');
  const mkt = grouped['Marketing'];

  expect(mkt.male).toBe(1);
  expect(mkt.female).toBe(1);
  expect(mkt.ageRange).toBe('30-50');
  expect(mkt.hair).toEqual({ Black: 1, Blond: 1 });
  expect(mkt.addressUser).toEqual({
    TerryMedhurst: '12345',
    JaneDoe: '54321',
  });
});
