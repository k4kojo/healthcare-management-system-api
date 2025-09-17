ALTER TABLE "prescriptions" ADD COLUMN "patient_id" uuid;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "duration" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "diagnosis" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_users_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;