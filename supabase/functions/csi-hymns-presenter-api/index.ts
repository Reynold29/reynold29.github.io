import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GITHUB_PAT = Deno.env.get("GITHUB_VAULT_PAT");
const REPO_OWNER = "Reynold29";
const REPO_NAME = "hymns-vault"; // Private vault repository

// In-memory cache per Edge Runtime worker instance
const fileCache = new Map<string, any[]>();

// Universal CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, accept, accept-language",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8"
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const url = new URL(req.url);
    const type = (url.searchParams.get("type") || "").toLowerCase().trim(); // "keerthane" | "hymn" | "mt"
    const number = parseInt(url.searchParams.get("number") || "", 10);

    if (!type || isNaN(number)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'type' or 'number' query parameter (e.g. ?type=keerthane&number=214)" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Map category to vault filename
    const filename = type === "keerthane" 
      ? "keerthane_data.json" 
      : type === "mt" 
      ? "mangalore_hymns_data.json" 
      : "hymns_data.json";

    // 2. Check Memory Cache
    let songs = fileCache.get(filename);

    if (!songs) {
      const authHeader = GITHUB_PAT
        ? (GITHUB_PAT.startsWith("ghp_") || GITHUB_PAT.startsWith("github_pat_") ? `Bearer ${GITHUB_PAT}` : `token ${GITHUB_PAT}`)
        : "";

      // Candidate paths supporting both repo root and content/ subfolder, and main/master branches
      const candidateUrls = [
        `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${filename}`,
        `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/content/${filename}`,
        `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/${filename}`,
        `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/content/${filename}`,
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`,
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/content/${filename}`
      ];

      let rawContent = "";
      let lastStatus = 0;

      for (const candidateUrl of candidateUrls) {
        try {
          const headers: Record<string, string> = {
            "User-Agent": "CSI-Hymns-FreeShow-Bridge",
            "Accept": candidateUrl.includes("api.github.com") ? "application/vnd.github.v3.raw" : "*/*"
          };
          if (authHeader) {
            headers["Authorization"] = authHeader;
          }

          const res = await fetch(candidateUrl, { headers });
          lastStatus = res.status;
          if (res.ok) {
            rawContent = await res.text();
            break;
          }
        } catch {
          // Continue to next candidate URL
        }
      }

      if (!rawContent) {
        return new Response(
          JSON.stringify({ 
            error: `Failed to fetch ${filename} from vault repository ${REPO_OWNER}/${REPO_NAME} (HTTP ${lastStatus}). Please ensure GITHUB_VAULT_PAT is set in Supabase Secrets.` 
          }),
          { status: 502, headers: corsHeaders }
        );
      }

      try {
        songs = JSON.parse(rawContent);
        if (Array.isArray(songs)) {
          fileCache.set(filename, songs);
        }
      } catch (parseErr: any) {
        return new Response(
          JSON.stringify({ error: `JSON parse error in ${filename}: ${parseErr.message}` }),
          { status: 502, headers: corsHeaders }
        );
      }
    }

    if (!songs || !Array.isArray(songs)) {
      return new Response(
        JSON.stringify({ error: `Unexpected data structure in ${filename}. Expected a JSON array.` }),
        { status: 502, headers: corsHeaders }
      );
    }

    // 3. Find Song by Number
    const song = songs.find((s: any) => s.number === number || s.displayNumber === number);

    if (!song) {
      return new Response(
        JSON.stringify({ error: `${type.toUpperCase()} #${number} was not found in hymnal vault.` }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 4. Return Clean JSON Response
    return new Response(JSON.stringify(song), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
