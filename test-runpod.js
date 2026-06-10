import dotenv from "dotenv";
dotenv.config();

async function test() {
  const runpodUrl = process.env.RUNPOD_API_URL;
  console.log("Loaded RUNPOD_API_URL from .env:", runpodUrl);
  
  if (!runpodUrl) {
    console.error("❌ RUNPOD_API_URL is missing in .env!");
    return;
  }

  const runpodPayload = {
    query: "hi",
    chat_history: [],
    student_context: { name: "test" },
    uploaded_file_name: "None",
    uploaded_file_context: null
  };

  const finalUrl = `${runpodUrl.replace(/\/$/, '')}/chat`;
  console.log("Sending POST request to:", finalUrl);

  try {
    const response = await fetch(finalUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runpodPayload),
    });

    console.log("Response Status:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("❌ Runpod returned an error status!");
      console.log(await response.text());
      return;
    }

    const text = await response.text();
    console.log("Runpod Output:", text);
  } catch (error) {
    console.error("❌ Fetch failed completely:", error.message);
  }
}

test();
