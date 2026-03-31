import { createClient } from '@sanity/client';

const client = createClient({
  projectId: "py1qczde",
  dataset: "production",
  apiVersion: "2024-03-19",
  useCdn: false
});

async function main() {
  try {
    const data = await client.fetch(`*[_type == "product"]`);
    console.log("Total docs:", data.length);
    if(data.length > 0) {
      console.log("Sample:", data[0]._id, JSON.stringify(data[0].variants));
    } else {
      console.log("NO DATA RETURNED!");
    }
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

main();
