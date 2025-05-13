export interface APIUser {
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  hair: { color: string };
  company: { department: string };
  address: { postalCode: string };
}

export async function fetchUsers(): Promise<APIUser[]> {
  const res = await fetch('https://dummyjson.com/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users;
}
