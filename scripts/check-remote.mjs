const base = "https://botsupport-production-e563.up.railway.app";
const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "admin@torreforte.org", password: "admin123" }) });
console.log(`login=${login.status}`);
const loginBody = await login.json().catch(() => ({}));
if (!loginBody.token) process.exit(0);
const headers = { Authorization: `Bearer ${loginBody.token}` };
for (const path of ["/api/zapi/config", "/api/departments", "/api/agents"]) {
  const response = await fetch(`${base}${path}`, { headers });
  const body = await response.json().catch(() => null);
  console.log(`${path}=${response.status} ${JSON.stringify(Array.isArray(body) ? { count: body.length } : body && typeof body === "object" ? Object.keys(body).slice(0, 12) : body)}`);
}
