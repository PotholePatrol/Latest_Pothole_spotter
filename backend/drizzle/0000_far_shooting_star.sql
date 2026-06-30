CREATE TABLE "contact_us_feedback" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contact_us_feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"reply" varchar(255) NOT NULL,
	"message" varchar(1024) NOT NULL,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"likes" jsonb DEFAULT '[]'::jsonb,
	"dislikes" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "contact_us_feedback_reply" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contact_us_feedback_reply_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"feedback_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"reply" varchar(255) NOT NULL,
	"message" varchar(1024) NOT NULL,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"likes" jsonb DEFAULT '[]'::jsonb,
	"dislikes" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "detections" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"label" varchar(255),
	"image_url" varchar(255),
	"confidence" real,
	"lat" real,
	"lng" real,
	"stretch_start_lat" real,
	"stretch_start_lng" real,
	"stretch_end_lat" real,
	"stretch_end_lng" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "location_preferences" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"preferred_lat" real,
	"preferred_lng" real
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"google_id" varchar(255),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"password" varchar(255),
	"phone_number" varchar(255),
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"country" varchar(100),
	"is_admin" boolean DEFAULT false,
	"is_google_account" boolean DEFAULT false,
	"profile_pic" varchar(255) DEFAULT 'https://th.bing.com/th/id/OIP.1yoSL-WO0YU5mQKROudvswHaHa?w=180&h=180&c=7&r=0&o=7&pid=1.7&rm=3',
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "contact_us_feedback_reply" ADD CONSTRAINT "contact_us_feedback_reply_feedback_id_contact_us_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."contact_us_feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_preferences" ADD CONSTRAINT "location_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;