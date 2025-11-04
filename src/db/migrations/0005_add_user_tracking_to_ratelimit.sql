--> statement-breakpoint
ALTER TABLE "rateLimit" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "rateLimit" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "rateLimit" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "rateLimit" ADD CONSTRAINT "rateLimit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

