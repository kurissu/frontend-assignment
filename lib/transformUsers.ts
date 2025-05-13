import { APIUser } from './fetchUsers';

type GroupedResult = {
  [department: string]: {
    male: number;
    female: number;
    ageRange: string;
    hair: Record<string, number>;
    addressUser: Record<string, string>;
  };
};

export function transformUsers(users: APIUser[]): GroupedResult {
  const result: GroupedResult = {};

  for (const user of users) {
    const dept = user.company.department;
    const gender = user.gender.toLowerCase();
    const hairColor = user.hair.color;
    const fullName = `${user.firstName}${user.lastName}`;
    const postal = user.address.postalCode;
    const age = user.age;

    if (!result[dept]) {
      result[dept] = {
        male: 0,
        female: 0,
        ageRange: '',
        hair: {},
        addressUser: {},
      };
    }

    const group = result[dept];

    // Count gender
    if (gender === 'male') group.male++;
    else if (gender === 'female') group.female++;

    // Track min/max age
    const ages = (group as any)._ages || [];
    ages.push(age);
    (group as any)._ages = ages;

    // Hair color count
    group.hair[hairColor] = (group.hair[hairColor] || 0) + 1;

    // Address user
    group.addressUser[fullName] = postal;
  }

  // Set age range
  for (const dept in result) {
    const ages = (result[dept] as any)._ages as number[];
    if (ages?.length) {
      const min = Math.min(...ages);
      const max = Math.max(...ages);
      result[dept].ageRange = `${min}-${max}`;
      delete (result[dept] as any)._ages;
    }
  }

  return result;
}
