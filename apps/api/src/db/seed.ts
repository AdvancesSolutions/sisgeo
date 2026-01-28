import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '../entities/user.entity';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'sigeo',
  entities: [User],
  synchronize: false,
});

async function seed() {
  await ds.initialize();
  const repo = ds.getRepository(User);
  const email = 'admin@sigeo.local';
  let u = await repo.findOne({ where: { email } });
  if (u) {
    console.log('Admin user already exists');
    await ds.destroy();
    return;
  }
  const hash = await bcrypt.hash('admin123', 10);
  u = repo.create({
    id: uuid(),
    name: 'Admin',
    email,
    role: 'ADMIN',
    passwordHash: hash,
  });
  await repo.save(u);
  console.log('Admin user created: admin@sigeo.local / admin123');
  await ds.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
