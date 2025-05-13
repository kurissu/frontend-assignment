import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchUsers } from '@/lib/fetchUsers';
import { transformUsers } from '@/lib/transformUsers';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await fetchUsers();
    const grouped = transformUsers(users);
    res.status(200).json(grouped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
