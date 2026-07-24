import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import db from "./db";

const app = new Hono();

// Serve static files from public/
app.use("/public/*", serveStatic({ root: import.meta.dir }));

// Volunteer form submission
app.post("/api/volunteer", async (c) => {
  try {
    const body = await c.req.json();
    const { first_name, last_name, email, phone, zip_code, interests, message } = body;

    if (!first_name || !last_name || !email) {
      return c.json({ error: "First name, last name, and email are required." }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Please enter a valid email address." }, 400);
    }

    const stmt = db.prepare(
      `INSERT INTO volunteers (first_name, last_name, email, phone, zip_code, interests, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      first_name.trim(),
      last_name.trim(),
      email.trim().toLowerCase(),
      phone?.trim() || null,
      zip_code?.trim() || null,
      Array.isArray(interests) ? interests.join(", ") : (interests || null),
      message?.trim() || null
    );

    return c.json({ success: true, message: "Thank you for signing up! We'll be in touch soon." });
  } catch (err) {
    console.error("Volunteer sign-up error:", err);
    return c.json({ error: "Something went wrong. Please try again." }, 500);
  }
});

// Serve index.html for root
app.get("/", (c) => {
  return Bun.file(`${import.meta.dir}/public/index.html`).text().then((html) =>
    new Response(html, { headers: { "Content-Type": "text/html" } })
  );
});

// Serve volunteer page
app.get("/volunteer", (c) => {
  return Bun.file(`${import.meta.dir}/public/volunteer.html`).text().then((html) =>
    new Response(html, { headers: { "Content-Type": "text/html" } })
  );
});

const port = Number(process.env.PORT) || 3000;
console.log(`Jay 2028 campaign site running on port ${port}`);

export default { port, fetch: app.fetch };
