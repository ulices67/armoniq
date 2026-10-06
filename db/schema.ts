import { sqliteTable,text,integer,index,primaryKey } from 'drizzle-orm/sqlite-core';
export const profiles=sqliteTable('profiles',{
 userId:text('user_id').primaryKey(),name:text('name').notNull(),instrument:text('instrument').notNull(),level:text('level').notNull(),goal:text('goal').notNull(),minutes:integer('minutes').notNull(),settings:text('settings').notNull().default('{}'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
});
export const completions=sqliteTable('completions',{
 userId:text('user_id').notNull().references(()=>profiles.userId,{onDelete:'cascade'}),instrument:text('instrument').notNull(),lessonId:text('lesson_id').notNull(),completedAt:integer('completed_at').notNull()
},t=>[primaryKey({columns:[t.userId,t.instrument,t.lessonId]})]);
export const sessions=sqliteTable('sessions',{
 id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>profiles.userId,{onDelete:'cascade'}),instrument:text('instrument').notNull(),kind:text('kind').notNull(),startedAt:integer('started_at').notNull(),finishedAt:integer('finished_at'),seconds:integer('seconds').notNull().default(0),score:integer('score'),observations:text('observations').notNull().default('{}')
},t=>[index('idx_sessions_user_started').on(t.userId,t.startedAt)]);
export const favorites=sqliteTable('favorites',{
 userId:text('user_id').notNull().references(()=>profiles.userId,{onDelete:'cascade'}),itemId:text('item_id').notNull()
},t=>[primaryKey({columns:[t.userId,t.itemId]})]);
