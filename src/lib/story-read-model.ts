import { db } from "./db";
import { runMigrations } from "./migrations";

export type StoryPreview = { id: string; headline: string; summary: string | null; state: string; importance: number; sourceCount: number; articleCount: number; updatedAt: string };
export type StoryArticle = { id: string; title: string; canonicalUrl: string; excerpt: string | null; publishedAt: string | null; sourceName: string; sourceDomain: string; sourceCountry: string | null; sourceLanguage: string | null; decision: string; score: number | null; reasonJson: string; algorithmVersion: string };
export type StoryClaimEvidence = { id: string; articleTitle: string; articleUrl: string; sourceName: string; stance: string; note: string; evidenceSpan: string | null };
export type StoryClaim = { id: string; text: string; claimType: string; status: string; analysisVersion: string; createdAt: string; evidence: StoryClaimEvidence[]; primaryMaterials: Array<{ id: string; title: string; url: string; materialType: string; stance: string; note: string }> };
export type StoryDiversity = { sourceCount: number; sourcesWithOwnership: number; recordedOwnerGroups: number; reportingChainCount: number; unclassifiedArticles: number };
export type StoryOperation = { id: string; action: string; reason: string; relatedStoryId: string | null; createdAt: string };
export type StorySummary = { text: string; evidenceArticleId: string; methodVersion: string; updatedAt: string };
export type PrimaryMaterial = { id: string; title: string; materialType: string; url: string; relevanceNote: string; publishedAt: string | null; methodVersion: string };
export type CoverageRecord = { articleId: string; coverageForm: string; focusNote: string; methodVersion: string };
export type EvidenceCorrection = { id: string; targetType: string; targetId: string; note: string; methodVersion: string; createdAt: string };
export type StoryRecomputation = { id: string; reason: string; detailsJson: string; methodVersion: string; createdAt: string };
export type StoryDetail = StoryPreview & { articles: StoryArticle[]; claims: StoryClaim[]; primaryMaterials: PrimaryMaterial[]; topic: string | null; coverageRecords: CoverageRecord[]; corrections: EvidenceCorrection[]; recomputations: StoryRecomputation[]; diversity: StoryDiversity; operations: StoryOperation[]; summaryRecord: StorySummary | null };
export type SourceProfile = { id: string; name: string; domain: string; countryCode: string | null; languageTag: string | null; sourceType: string | null; articleCount: number; storyCount: number; assessment: { status: string; rationale: string | null; evidenceUrl: string | null; methodVersion: string; reviewedAt: string | null } | null; owners: Array<{ ownerName: string; evidenceUrl: string; assertedAt: string | null; confidence: number }>; articles: Array<{ id: string; title: string; canonicalUrl: string; publishedAt: string | null; storyId: string | null; storyHeadline: string | null }> };

export function listStories(limit = 30, countryCode?: string): StoryPreview[] {
  runMigrations();
  return db.prepare(`
    SELECT stories.id, stories.headline, stories.summary, stories.state, stories.importance,
      stories.updated_at AS updatedAt, COUNT(DISTINCT articles.source_id) AS sourceCount,
      COUNT(story_articles.article_id) AS articleCount
    FROM stories
    LEFT JOIN story_articles ON story_articles.story_id = stories.id AND story_articles.decision != 'rejected'
    LEFT JOIN articles ON articles.id = story_articles.article_id
    WHERE stories.state != 'superseded'
      AND (? IS NULL OR EXISTS (
        SELECT 1 FROM story_articles regional_memberships
        JOIN articles regional_articles ON regional_articles.id = regional_memberships.article_id
        JOIN sources regional_sources ON regional_sources.id = regional_articles.source_id
        WHERE regional_memberships.story_id = stories.id AND regional_memberships.decision != 'rejected' AND regional_sources.country_code = ?
      ))
    GROUP BY stories.id ORDER BY stories.importance DESC, stories.updated_at DESC LIMIT ?
  `).all(countryCode ?? null, countryCode ?? null, limit) as StoryPreview[];
}

export function getSourceProfile(domain: string): SourceProfile | null {
  runMigrations();
  const source = db.prepare(`
    SELECT sources.id, sources.name, sources.domain, sources.country_code AS countryCode, sources.language_tag AS languageTag, sources.source_type AS sourceType,
      COUNT(DISTINCT articles.id) AS articleCount, COUNT(DISTINCT story_articles.story_id) AS storyCount
    FROM sources LEFT JOIN articles ON articles.source_id = sources.id
    LEFT JOIN story_articles ON story_articles.article_id = articles.id AND story_articles.decision != 'rejected'
    WHERE sources.domain = ? GROUP BY sources.id
  `).get(domain) as Omit<SourceProfile, "assessment" | "owners" | "articles"> | undefined;
  if (!source) return null;
  const assessment = db.prepare("SELECT status, rationale, evidence_url AS evidenceUrl, method_version AS methodVersion, reviewed_at AS reviewedAt FROM source_assessments WHERE source_id = ?").get(source.id) as SourceProfile["assessment"];
  const owners = db.prepare("SELECT owner_name AS ownerName, evidence_url AS evidenceUrl, asserted_at AS assertedAt, confidence FROM ownership_assertions WHERE source_id = ? ORDER BY asserted_at DESC, created_at DESC").all(source.id) as SourceProfile["owners"];
  const articles = db.prepare(`
    SELECT articles.id, articles.title, articles.canonical_url AS canonicalUrl, articles.published_at AS publishedAt,
      stories.id AS storyId, stories.headline AS storyHeadline
    FROM articles LEFT JOIN story_articles ON story_articles.article_id = articles.id AND story_articles.decision != 'rejected'
    LEFT JOIN stories ON stories.id = story_articles.story_id AND stories.state != 'superseded'
    WHERE articles.source_id = ? ORDER BY articles.published_at DESC, articles.discovered_at DESC LIMIT 50
  `).all(source.id) as SourceProfile["articles"];
  return { ...source, assessment, owners, articles };
}

export function getStory(id: string): StoryDetail | null {
  runMigrations();
  const story = db.prepare(`
    SELECT stories.id, stories.headline, stories.summary, stories.state, stories.importance,
      stories.updated_at AS updatedAt, COUNT(DISTINCT articles.source_id) AS sourceCount,
      COUNT(story_articles.article_id) AS articleCount
    FROM stories LEFT JOIN story_articles ON story_articles.story_id = stories.id AND story_articles.decision != 'rejected'
    LEFT JOIN articles ON articles.id = story_articles.article_id
    WHERE stories.id = ? AND stories.state != 'superseded' GROUP BY stories.id
  `).get(id) as StoryPreview | undefined;
  if (!story) return null;
  const articles = db.prepare(`
    SELECT articles.id, articles.title, articles.canonical_url AS canonicalUrl, articles.excerpt,
      articles.published_at AS publishedAt, sources.name AS sourceName, sources.domain AS sourceDomain,
      sources.country_code AS sourceCountry, sources.language_tag AS sourceLanguage,
      story_articles.decision, story_articles.score, story_articles.reason_json AS reasonJson,
      story_articles.algorithm_version AS algorithmVersion
    FROM story_articles JOIN articles ON articles.id = story_articles.article_id JOIN sources ON sources.id = articles.source_id
    WHERE story_articles.story_id = ? AND story_articles.decision != 'rejected'
    ORDER BY articles.published_at DESC, articles.discovered_at DESC
  `).all(id) as StoryArticle[];
  const claimRows = db.prepare(`
    SELECT claims.id, claims.text, claims.claim_type AS claimType, COALESCE(claim_assessments.status, claims.status) AS status,
      COALESCE(claim_assessments.analysis_version, claims.analysis_version) AS analysisVersion, claims.created_at AS createdAt,
      claim_evidence.id AS evidenceId,
      articles.title AS articleTitle, articles.canonical_url AS articleUrl, sources.name AS sourceName,
      claim_evidence.stance, claim_evidence.note, claim_evidence.evidence_span AS evidenceSpan
    FROM claims JOIN claim_evidence ON claim_evidence.claim_id = claims.id
    JOIN articles ON articles.id = claim_evidence.article_id JOIN sources ON sources.id = articles.source_id
    LEFT JOIN claim_assessments ON claim_assessments.id = (
      SELECT id FROM claim_assessments WHERE claim_id = claims.id ORDER BY created_at DESC, id DESC LIMIT 1
    )
    WHERE claims.story_id = ? ORDER BY claims.created_at DESC, claim_evidence.created_at ASC
  `).all(id) as Array<Omit<StoryClaim, "evidence" | "primaryMaterials"> & StoryClaimEvidence & { evidenceId: string }>;
  const materialsByClaim = db.prepare(`SELECT claim_primary_materials.claim_id AS claimId, primary_materials.id, primary_materials.title, primary_materials.url, primary_materials.material_type AS materialType, claim_primary_materials.stance, claim_primary_materials.note FROM claim_primary_materials JOIN primary_materials ON primary_materials.id = claim_primary_materials.primary_material_id WHERE primary_materials.story_id = ?`).all(id) as Array<{ claimId: string } & StoryClaim["primaryMaterials"][number]>;
  const claims = claimRows.reduce<StoryClaim[]>((records, row) => {
    let claim = records.find((record) => record.id === row.id);
    if (!claim) {
      const { evidenceId: _evidenceId, articleTitle, articleUrl, sourceName, stance, note, evidenceSpan, ...base } = row;
      claim = { ...base, evidence: [], primaryMaterials: materialsByClaim.filter((material) => material.claimId === row.id).map(({ claimId: _claimId, ...material }) => material) };
      records.push(claim);
    }
    claim.evidence.push({ id: row.evidenceId, articleTitle: row.articleTitle, articleUrl: row.articleUrl, sourceName: row.sourceName, stance: row.stance, note: row.note, evidenceSpan: row.evidenceSpan });
    return records;
  }, []);
  const primaryMaterials = db.prepare("SELECT id, title, material_type AS materialType, url, relevance_note AS relevanceNote, published_at AS publishedAt, method_version AS methodVersion FROM primary_materials WHERE story_id = ? ORDER BY created_at DESC").all(id) as PrimaryMaterial[];
  const topic = (db.prepare("SELECT topic FROM story_topics WHERE story_id = ?").get(id) as { topic: string } | undefined)?.topic ?? null;
  const coverageRecords = db.prepare("SELECT article_id AS articleId, coverage_form AS coverageForm, focus_note AS focusNote, method_version AS methodVersion FROM article_coverage_records WHERE story_id = ?").all(id) as CoverageRecord[];
  const corrections = db.prepare("SELECT id, target_type AS targetType, target_id AS targetId, note, method_version AS methodVersion, created_at AS createdAt FROM evidence_corrections WHERE story_id = ? ORDER BY created_at DESC").all(id) as EvidenceCorrection[];
  const recomputations = db.prepare("SELECT id, reason, details_json AS detailsJson, method_version AS methodVersion, created_at AS createdAt FROM story_recomputations WHERE story_id = ? ORDER BY created_at DESC LIMIT 10").all(id) as StoryRecomputation[];
  const diversity = db.prepare(`
    SELECT COUNT(DISTINCT sources.id) AS sourceCount,
      COUNT(DISTINCT CASE WHEN ownership_assertions.id IS NOT NULL THEN sources.id END) AS sourcesWithOwnership,
      COUNT(DISTINCT ownership_assertions.owner_name) AS recordedOwnerGroups,
      (SELECT COUNT(*) FROM reporting_chains WHERE story_id = ?) AS reportingChainCount,
      (SELECT COUNT(*) FROM story_articles chain_members WHERE chain_members.story_id = ? AND chain_members.decision != 'rejected' AND NOT EXISTS (SELECT 1 FROM reporting_chain_articles WHERE reporting_chain_articles.article_id = chain_members.article_id)) AS unclassifiedArticles
    FROM story_articles JOIN articles ON articles.id = story_articles.article_id JOIN sources ON sources.id = articles.source_id
    LEFT JOIN ownership_assertions ON ownership_assertions.source_id = sources.id
    WHERE story_articles.story_id = ? AND story_articles.decision != 'rejected'
  `).get(id, id, id) as StoryDiversity;
  const operations = db.prepare("SELECT id, action, reason, related_story_id AS relatedStoryId, created_at AS createdAt FROM story_operations WHERE story_id = ? OR related_story_id = ? ORDER BY created_at DESC").all(id, id) as StoryOperation[];
  const summaryRecord = db.prepare("SELECT text, evidence_article_id AS evidenceArticleId, method_version AS methodVersion, updated_at AS updatedAt FROM story_summaries WHERE story_id = ?").get(id) as StorySummary | undefined;
  return { ...story, articles, claims, primaryMaterials, topic, coverageRecords, corrections, recomputations, diversity, operations, summaryRecord: summaryRecord ?? null };
}
