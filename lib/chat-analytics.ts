/**
 * Chat Analytics Utilities
 * Anonymization, categorization, and topic extraction for chat interactions
 */

/**
 * Anonymize query text to remove personal information
 * @param queryText - Raw user query
 * @returns Anonymized query with PII removed
 */
export function anonymizeQuery(queryText: string): string {
  let text = queryText;

  // Remove email addresses
  text = text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi, '[EMAIL]');

  // Remove phone numbers (various formats)
  text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
  text = text.replace(/\(\d{3}\)\s*\d{3}-\d{4}/g, '[PHONE]');
  text = text.replace(/\b1?[-.]?\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

  // Remove SSN patterns
  text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

  // Remove specific addresses (keep city names)
  text = text.replace(
    /\b\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way|Place|Pl)\b/gi,
    '[ADDRESS]'
  );

  // Remove potential names in quotes
  text = text.replace(/"[A-Z][a-z]+ [A-Z][a-z]+"/g, '[NAME]');

  // Remove ZIP codes
  text = text.replace(/\b\d{5}(-\d{4})?\b/g, '[ZIP]');

  return text;
}

/**
 * Categorize a query based on its content
 * @param queryText - User query
 * @returns Category string
 */
export function categorizeQuery(queryText: string): string {
  const text = queryText.toLowerCase();

  const categories: Record<string, RegExp> = {
    job_search: /(job|employment|hiring|position|opening|vacancy|work|career opportunity|apply|application)/,
    career_guidance: /(resume|cv|cover letter|interview|career|professional development|skills|qualification|networking|linkedin)/,
    training: /(training|certification|certify|course|class|workshop|program|learn|skill development|wioa|apprenticeship)/,
    youth_program: /(youth|teen|teenager|young adult|student|high school|summer job|internship|work experience)/,
    employer_services: /(employer|hire|recruit|hiring|tax credit|workforce|business|company|applicant|candidate)/,
    unemployment: /(unemployment|benefits|claim|jobless|laid off|termination|assistance|support)/,
    general: /(hello|hi|help|thanks|thank you|what|how|when|where|who)/,
  };

  for (const [category, pattern] of Object.entries(categories)) {
    if (pattern.test(text)) {
      return category;
    }
  }

  return 'general';
}

/**
 * Extract topics from a query for trend analysis
 * @param queryText - User query
 * @returns Array of detected topics
 */
export function extractTopics(queryText: string): string[] {
  const text = queryText.toLowerCase();
  const topics: string[] = [];

  // Job-related topics
  const jobTopics: Record<string, RegExp> = {
    resume: /resume|cv/,
    interview: /interview/,
    job_search: /job search|looking for work|finding employment/,
    career: /career/,
    employment: /employment|employed/,
    hiring: /hiring|recruit/,
    application: /apply|application/,
  };

  // Program topics
  const programTopics: Record<string, RegExp> = {
    wioa: /wioa|workforce innovation/,
    training: /training|train/,
    certification: /certification|certify|certificate/,
    workshop: /workshop|seminar|class/,
    apprenticeship: /apprenticeship|apprentice/,
  };

  // Service topics
  const serviceTopics: Record<string, RegExp> = {
    youth_program: /youth program|teen|young adult/,
    employer_services: /employer service|business service/,
    unemployment: /unemployment|jobless/,
    benefits: /benefits|assistance/,
  };

  // Skills topics
  const skillsTopics: Record<string, RegExp> = {
    skills: /skills|skilled/,
    education: /education|degree|diploma/,
    experience: /experience|background/,
    professional_development: /professional development|upskilling|reskilling/,
  };

  // Location topics (Huron County cities)
  const locationTopics: Record<string, RegExp> = {
    huron_county: /huron county/,
    norwalk: /norwalk/,
    bellevue: /bellevue/,
    willard: /willard/,
    monroeville: /monroeville/,
    new_london: /new london/,
    greenwich: /greenwich/,
  };

  // Check all topic categories
  const allTopics = {
    ...jobTopics,
    ...programTopics,
    ...serviceTopics,
    ...skillsTopics,
    ...locationTopics,
  };

  for (const [topic, pattern] of Object.entries(allTopics)) {
    if (pattern.test(text)) {
      topics.push(topic);
    }
  }

  return topics;
}

/**
 * Calculate word count in text
 * @param text - Text to count words in
 * @returns Number of words
 */
export function getWordCount(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Format analytics data for storage
 * @param message - Original user message
 * @param responseTime - Response time in milliseconds
 * @param hasWebSearch - Whether web search was used
 * @param sources - Sources used in response
 * @param errorOccurred - Whether an error occurred
 * @returns Formatted analytics record
 */
export function formatAnalyticsData(
  message: string,
  responseTime: number,
  hasWebSearch: boolean,
  sources: { documents?: number; chunks?: number },
  errorOccurred: boolean = false
) {
  const anonymizedQuery = anonymizeQuery(message);

  return {
    query_text: anonymizedQuery,
    query_category: categorizeQuery(message),
    query_topics: extractTopics(message),
    word_count: getWordCount(message),
    response_time_ms: responseTime,
    has_web_search: hasWebSearch,
    sources_used: sources || {},
    error_occurred: errorOccurred,
  };
}
