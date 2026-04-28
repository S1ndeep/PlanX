const BLOCKED_TERMS = [
  "idiot",
  "stupid",
  "dumb",
  "moron",
  "loser",
  "hate",
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "harami",
  "chutiya",
  "madarchod",
  "bhenchod",
  "gandu",
  "lund",
  "randi"
];

const normalizeForMatching = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const collapseForObfuscationMatching = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const hasBlockedLanguage = (value = "") => {
  const normalized = normalizeForMatching(value);
  const collapsed = collapseForObfuscationMatching(value);

  return BLOCKED_TERMS.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordPattern = new RegExp(`(^|\\s)${escaped}($|\\s)`, "i");
    const collapsedTerm = term.replace(/[^a-z0-9]/g, "");

    return wordPattern.test(normalized) || (collapsedTerm && collapsed.includes(collapsedTerm));
  });
};

const hasSuspiciousRepetition = (value = "") => {
  const normalized = normalizeForMatching(value);

  if (!normalized) {
    return false;
  }

  if (/(.)\1{5,}/i.test(normalized.replace(/\s+/g, ""))) {
    return true;
  }

  const words = normalized.split(" ").filter(Boolean);
  if (words.length >= 4) {
    const uniqueWordCount = new Set(words).size;
    if (uniqueWordCount <= Math.max(1, Math.floor(words.length / 3))) {
      return true;
    }
  }

  return false;
};

const hasSpamSignals = (value = "") => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return false;
  }

  if (/https?:\/\//i.test(normalized) || /www\./i.test(normalized)) {
    return true;
  }

  if (hasSuspiciousRepetition(normalized)) {
    return true;
  }

  return false;
};

export const validateReviewComment = (comment = "") => {
  const normalizedComment = String(comment || "").trim();

  if (!normalizedComment) {
    return { ok: true, normalizedComment };
  }

  if (hasBlockedLanguage(normalizedComment)) {
    return {
      ok: false,
      message: "Please remove abusive language from your review."
    };
  }

  if (hasSpamSignals(normalizedComment)) {
    return {
      ok: false,
      message: "Your review looks like spam or fake text. Please rewrite it clearly."
    };
  }

  return {
    ok: true,
    normalizedComment
  };
};
