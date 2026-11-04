import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GITHUB_PAT = Deno.env.get("GITHUB_VAULT_PAT");
const REPO_OWNER = "Reynold29";
const REPO_NAME = "csi-hymns-vault";

serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json; charset=utf-8"
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type"); // "keerthane", "hymn", or "mt"
  const number = parseInt(url.searchParams.get("number") || "", 10);

  if (!type || isNaN(number)) {
    return new Response(JSON.stringify({ error: "Missing or invalid 'type' or 'number' query parameter" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // Map category to vault filename
  const filename = type === "keerthane" 
    ? "keerthane_data.json" 
    : type === "mt" 
    ? "mangalore_hymns_data.json" 
    : "hymns_data.json";

  try {
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3.raw",
      "User-Agent": "CSI-Hymns-FreeShow-API"
    };

    if (GITHUB_PAT) {
      headers["Authorization"] = `Bearer ${GITHUB_PAT}`;
    }

    // Fetch songbook from GitHub vault
    const ghRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`,
      { headers }
    );

    if (!ghRes.ok) {
      return new Response(
        JSON.stringify({ error: `Vault request failed with HTTP ${ghRes.status}. Check GITHUB_VAULT_PAT.` }),
        { status: 502, headers: corsHeaders }
      );
    }

    const allSongs = await ghRes.json();
    const song = allSongs.find((s: any) => s.number === number);

    if (!song) {
      return new Response(
        JSON.stringify({ error: `${type.toUpperCase()} #${number} not found in hymnal vault.` }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Return the single song JSON
    return new Response(JSON.stringify(song), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
