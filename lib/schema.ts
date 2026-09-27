import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const stories = sqliteTable("stories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  idea: text("idea").notNull(),
  style: text("style").default("xiyou-chibi").notNull(),
  layout: text("layout").default("vertical").notNull(),
  userId: text("user_id").default("local").notNull(),
  scriptJson: text("script_json"),
  composedImageUrl: text("composed_image_url"),
  status: text("status").default("script").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const panels = sqliteTable("panels", {
  id: text("id").primaryKey(),
  storyId: text("story_id")
    .references(() => stories.id, { onDelete: "cascade" })
    .notNull(),
  panelIndex: integer("panel_index").notNull(),
  role: text("role").notNull(),
  scene: text("scene").notNull(),
  shot: text("shot").notNull(),
  charactersJson: text("characters_json").notNull(),
  dialogueJson: text("dialogue_json").notNull(),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  userId: text("user_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const storiesRelations = relations(stories, ({ many }) => ({
  panels: many(panels),
}));

export const panelsRelations = relations(panels, ({ one }) => ({
  story: one(stories, {
    fields: [panels.storyId],
    references: [stories.id],
  }),
}));

export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
export type Page = typeof panels.$inferSelect;
export type NewPage = typeof panels.$inferInsert;
export type Panel = Page;
export type NewPanel = NewPage;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
