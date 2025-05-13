import { APIUser } from './fetchUsers';

export type GroupedResult = {
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

  // Track ages separately to avoid polluting output type
  const ageTracker: Map<string, number[]> = new Map();

  for (const user of users) {
    const dept = user.company.department;
    const gender = user.gender.toLowerCase();
    const hairColor = user.hair.color;
    const fullName = `${user.firstName}${user.lastName}`;
    const postalCode = user.address.postalCode;

    // Initialize department if missing
    if (!result[dept]) {
      result[dept] = {
        male: 0,
        female: 0,
        ageRange: '',
        hair: {},
        addressUser: {},
      };
      ageTracker.set(dept, []);
    }

    const group = result[dept];

    // Gender count
    if (gender === 'male') group.male++;
    else if (gender === 'female') group.female++;

    // Track ages
    ageTracker.get(dept)!.push(user.age);

    // Hair color count
    group.hair[hairColor] = (group.hair[hairColor] || 0) + 1;

    // Postal code by name
    group.addressUser[fullName] = postalCode;
  }

  // Compute ageRange from tracked ages
  for (const [dept, ages] of ageTracker.entries()) {
    const min = Math.min(...ages);
    const max = Math.max(...ages);
    result[dept].ageRange = `${min}-${max}`;
  }

  return result;
}
