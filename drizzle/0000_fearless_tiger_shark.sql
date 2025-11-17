CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(120) NOT NULL,
	"genre" varchar(50) NOT NULL,
	"tone" varchar(50) NOT NULL,
	"main_characters" jsonb DEFAULT '[]'::jsonb,
	"plot_seed" text NOT NULL,
	"difficulty" varchar(20) DEFAULT 'medium',
	"image_prompt" text,
	"status" varchar(20) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL
);
