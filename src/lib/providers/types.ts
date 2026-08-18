export type FeedDefinition = {
  id: string;
  name: string;
  url: string;
  countryCode?: string;
  languageTag?: string;
  sourceType?: string;
};

export type ArticleCandidate = {
  provider: "rss" | "gdelt";
  providerId: string;
  source: Omit<FeedDefinition, "id" | "url"> & { domain: string };
  url: string;
  rawUrl?: string;
  title: string;
  author?: string;
  publishedAt?: string;
  excerpt?: string;
  languageTag?: string;
};
