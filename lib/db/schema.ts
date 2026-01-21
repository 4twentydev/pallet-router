import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  pin: text('pin').notNull(), // Hashed PIN
  role: text('role').notNull().default('user'), // 'admin' or 'user'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pallets = pgTable('pallets', {
  id: serial('id').primaryKey(),
  jobNumber: text('job_number').notNull(),
  releaseNumber: text('release_number').notNull(),
  palletNumber: text('pallet_number').notNull(),
  size: text('size').default(''),
  elevation: text('elevation').default(''),
  made: boolean('made').default(false).notNull(),
  accList: text('acc_list').default(''),
  shippedDate: text('shipped_date').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type inference helpers
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Pallet = typeof pallets.$inferSelect;
export type NewPallet = typeof pallets.$inferInsert;
