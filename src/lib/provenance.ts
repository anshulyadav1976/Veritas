type MembershipReason = { score?: unknown; signal?: unknown };

export function describeMembership(reasonJson: string, algorithmVersion: string) {
  try {
    const reason = JSON.parse(reasonJson) as MembershipReason;
    if (typeof reason.signal === "string" && typeof reason.score === "number") return `${reason.signal}; ${Math.round(reason.score * 100)}% similarity (${algorithmVersion})`;
  } catch { /* The stored provenance remains visible even if an older record is malformed. */ }
  return `Recorded by ${algorithmVersion}`;
}
