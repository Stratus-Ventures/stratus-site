import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { seed } from "drizzle-seed";
import * as schema from "../src/lib/server/db/schema.js";

config();

const main = async () => {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await db.delete(schema.stratusMetrics);
  await db.delete(schema.stratusProducts);

  const eventTypes = ["user_created", "download_started", "subscription_activated"];
  const productNames = [
    "Stratus Analytics",
    "Stratus Cloud", 
    "Stratus Security",
    "Stratus Connect",
    "Stratus AI"
  ];
  const taglines = [
    "Real-time data insights for your business",
    "Scalable cloud infrastructure made simple", 
    "Enterprise-grade security solutions",
    "Seamless integration platform",
    "AI-powered business intelligence"
  ];
  const urls = [
    "https://analytics.stratus.com",
    "https://cloud.stratus.com",
    "https://security.stratus.com", 
    "https://connect.stratus.com",
    "https://ai.stratus.com"
  ];
  const city_codes = [
    "PHX",
    "NYC",
    "AUS",
    "HTX",
    "CHA",
    "CIN",
    "KCC"
  ];
  const country_codes = [
    "USA",
    "GBR",
    "AUD",
    "JAP",
    "CHN",
    "UAE",
    "SAE",
  ];

  await seed(db, schema).refine((funcs) => ({
    stratusProducts: {
      count: 5,
      columns: {
        name: funcs.valuesFromArray({ values: productNames }),
        tagline: funcs.valuesFromArray({ values: taglines }),
        url: funcs.valuesFromArray({ values: urls })
      },
      with: {
        stratusMetrics: 10
      }
    },
    stratusMetrics: {
      columns: {
        event_type: funcs.valuesFromArray({ values: eventTypes }),
        origin_lat: funcs.number({ minValue: -90, maxValue: 90, precision: 10000 }),
        origin_long: funcs.number({ minValue: -180, maxValue: 180, precision: 10000 }),
        city_code: funcs.valuesFromArray({ values: city_codes }),
        country_code: funcs.valuesFromArray({ values: country_codes })
      }
    }
  }));

  console.log("✅ Database seeded successfully!");
  await client.end();
};

main();