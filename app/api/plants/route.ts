import { env } from "cloudflare:workers";

type TrefleSummary = {
  common_name: string | null;
  scientific_name: string;
  slug: string;
  image_url?: string | null;
};

type TrefleCollection = {
  data?: TrefleSummary[];
  links?: { next?: string | null };
  meta?: { total?: number | null };
};

type TrefleDetail = {
  data?: {
    common_name?: string | null;
    scientific_name?: string;
    slug?: string;
    main_species?: {
      growth?: {
        light?: number | null;
        soil_humidity?: number | null;
        soil_texture?: number | null;
        ph_minimum?: number | null;
        ph_maximum?: number | null;
        days_to_harvest?: number | null;
        row_spacing?: { cm?: number | null } | null;
      } | null;
      specifications?: {
        average_height?: { cm?: number | null } | null;
        maximum_height?: { cm?: number | null } | null;
        toxicity?: string | null;
      } | null;
    } | null;
  };
};

function lightLabel(value?: number | null) {
  if (value == null) return "Not recorded";
  if (value >= 8) return "Full sun";
  if (value >= 5) return "Sun or part shade";
  if (value >= 3) return "Part shade";
  return "Full shade";
}

function waterLabel(value?: number | null) {
  if (value == null) return "Not recorded";
  if (value >= 8) return "Wet or waterside";
  if (value >= 5) return "Consistently moist";
  if (value >= 3) return "Moderate";
  return "Low / drought tolerant";
}

function soilLabel(texture?: number | null, phMin?: number | null, phMax?: number | null) {
  let textureLabel = "Soil type not recorded";
  if (texture != null) {
    if (texture <= 2) textureLabel = "Clay or moisture-retentive";
    else if (texture <= 4) textureLabel = "Clay-loam or loam";
    else if (texture <= 6) textureLabel = "Loamy, free-draining";
    else if (texture <= 8) textureLabel = "Sandy or gritty";
    else textureLabel = "Rocky, very free-draining";
  }
  const ph = phMin != null && phMax != null ? ` · pH ${phMin}–${phMax}` : "";
  return `${textureLabel}${ph}`;
}

function plantEmoji(name: string) {
  const lower = name.toLowerCase();
  if (/tree|apple|pear|cherry|oak|maple|birch|willow/.test(lower)) return "🌳";
  if (/tomato|pepper|berry|fruit/.test(lower)) return "🍅";
  if (/bean|pea/.test(lower)) return "🫛";
  if (/herb|mint|sage|thyme|basil/.test(lower)) return "🌿";
  return "🌱";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("q")?.trim() ?? "";
  const requestedPage = Number.parseInt(requestUrl.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const runtimeEnv = env as unknown as { TREFLE_TOKEN?: string };
  const token = runtimeEnv.TREFLE_TOKEN;

  if (!token || (query.length > 0 && query.length < 2)) {
    return Response.json({ plants: [], configured: Boolean(token), hasMore: false, total: null });
  }

  try {
    const searchUrl = new URL(query ? "https://trefle.io/api/v1/plants/search" : "https://trefle.io/api/v1/plants");
    searchUrl.searchParams.set("token", token);
    searchUrl.searchParams.set("page", String(page));
    if (query) searchUrl.searchParams.set("q", query);
    const searchResponse = await fetch(searchUrl, { headers: { Accept: "application/json" } });
    if (!searchResponse.ok) throw new Error(`Catalogue returned ${searchResponse.status}`);
    let search = await searchResponse.json() as TrefleCollection;
    if (!(search.data?.length) && query.length > 3) {
      searchUrl.searchParams.set("q", query.slice(0, 3));
      const prefixResponse = await fetch(searchUrl, { headers: { Accept: "application/json" } });
      if (prefixResponse.ok) search = await prefixResponse.json() as TrefleCollection;
    }
    const matches = (search.data ?? []).slice(0, 8);

    const plants = await Promise.all(matches.map(async (match) => {
      let detail: TrefleDetail["data"] | undefined;
      try {
        const detailUrl = new URL(`https://trefle.io/api/v1/plants/${match.slug}`);
        detailUrl.searchParams.set("token", token);
        const response = await fetch(detailUrl, { headers: { Accept: "application/json" } });
        if (response.ok) detail = ((await response.json()) as TrefleDetail).data;
      } catch { /* Search results still remain useful without detail. */ }

      const growth = detail?.main_species?.growth;
      const specifications = detail?.main_species?.specifications;
      const heightCm = specifications?.average_height?.cm ?? specifications?.maximum_height?.cm ?? null;
      const name = match.common_name ?? match.scientific_name;
      const toxicity = specifications?.toxicity && specifications.toxicity !== "none" ? `; ${specifications.toxicity} toxicity recorded` : "";

      return {
        key: `trefle-${match.slug}`,
        name,
        scientific: match.scientific_name,
        emoji: plantEmoji(name),
        sun: lightLabel(growth?.light),
        water: waterLabel(growth?.soil_humidity),
        soil: soilLabel(growth?.soil_texture, growth?.ph_minimum, growth?.ph_maximum),
        heightM: typeof heightCm === "number" ? Math.round(heightCm / 10) / 100 : null,
        spacing: growth?.row_spacing?.cm ? `${growth.row_spacing.cm} cm` : "Not recorded",
        harvestDays: growth?.days_to_harvest ?? undefined,
        issue: `No specific disease susceptibility recorded${toxicity}`,
        tip: "Check local climate and cultivar guidance before planting.",
        imageUrl: match.image_url ?? undefined,
        external: true,
      };
    }));

    return Response.json({ plants, configured: true, hasMore: Boolean(search.links?.next), total: search.meta?.total ?? null, page });
  } catch (error) {
    return Response.json({ plants: [], configured: true, hasMore: false, total: null, error: error instanceof Error ? error.message : "Catalogue unavailable" }, { status: 502 });
  }
}
