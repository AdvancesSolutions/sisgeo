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
  const adminEmail = 'admin@sigeo.local';
  const funcEmail = 'func@sigeo.local';
  let admin = await repo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    admin = repo.create({
      id: uuid(),
      name: 'Admin',
      email: adminEmail,
      role: 'ADMIN',
      passwordHash: hash,
    });
    await repo.save(admin);
    console.log('Admin user created: admin@sigeo.local / admin123');
  } else {
    console.log('Admin user already exists');
  }
  let func = await repo.findOne({ where: { email: funcEmail } });
  if (!func) {
    const hash = await bcrypt.hash('func123', 10);
    func = repo.create({
      id: uuid(),
      name: 'Funcionário',
      email: funcEmail,
      role: 'FUNCIONARIO',
      passwordHash: hash,
    });
    await repo.save(func);
    console.log('Funcionário user created: func@sigeo.local / func123');
  }
  await ds.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
