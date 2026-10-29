export default function handler(req, res) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.headers.host;
  const protoHeader = req.headers["x-forwarded-proto"] || "https";
  const proto = String(protoHeader).split(",")[0].trim();
  const origin = `${proto}://${host}`;
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json({
    url: origin,
    name: "ARM Galaxy",
    iconUrl: `${origin}/assets/arm-logo-180.png`
  });
}
