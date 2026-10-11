import { writeFileSync } from "node:fs";

const res = await fetch(
  `https://api.getpostman.com/collections/${process.env.POSTMAN_COLLECTION_UID}`,
  { headers: { "X-API-Key": process.env.POSTMAN_API_KEY } },
);
if (!res.ok) {
  console.error("Postman API response:", await res.text());
  throw new Error(`Postman API error: ${res.status}`);
}

const { collection } = await res.json();
writeFileSync(
  "postman/collections/rivalry-ledger-api.postman_collection.json",
  JSON.stringify(collection, null, 2),
);
console.log("Collection written.");