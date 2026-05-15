/**
 * ============================================
 *  EUI Banking System — Job/Department Mappings
 * ============================================
 *  Maps department IDs to job title prefixes.
 *  Provides helpers to filter jobs by department
 *  and strip prefixes for UI display.
 */

// Maps department IDs to their expected job title prefixes
export const DEPARTMENT_PREFIXES = {
  10: 'RB_',  // Retail Banking
  20: 'IT_',  // IT Support
};

// Maps prefixes back to readable department contexts
export const PREFIX_DEPARTMENT_MAP = {
  'RB_': 10,
  'IT_': 20,
};

/**
 * Strips the prefix from a job title for display.
 * E.g., "RB_Teller" → "Teller", "IT_System_Administrator" → "System Administrator"
 */
export function stripJobPrefix(jobTitle) {
  if (!jobTitle) return '';
  // Match known prefixes
  const prefixMatch = jobTitle.match(/^(RB_|IT_)/);
  if (prefixMatch) {
    return jobTitle.slice(prefixMatch[1].length);
  }
  return jobTitle;
}

/**
 * Gets the prefix for a given department ID.
 */
export function getPrefixForDepartment(depId) {
  return DEPARTMENT_PREFIXES[depId] || '';
}

/**
 * Get the department ID from a job title's prefix.
 */
export function getDepartmentIdFromJobTitle(jobTitle) {
  if (!jobTitle) return null;
  const prefixMatch = jobTitle.match(/^(RB_|IT_)/);
  if (prefixMatch) {
    return PREFIX_DEPARTMENT_MAP[prefixMatch[1]] || null;
  }
  return null;
}

/**
 * Filters an array of job objects to only include jobs whose titles
 * match the prefix for the given department ID.
 * Each job object should have a `JOB_TITLE` or `job_title` property.
 */
export function filterJobsByDepartment(jobs, depId) {
  const prefix = getPrefixForDepartment(depId);
  if (!prefix) return jobs; // No filtering if unknown department
  return jobs.filter(job => {
    const title = job.JOB_TITLE || job.job_title || '';
    return title.startsWith(prefix);
  });
}

/**
 * Prepares job options for a dropdown by stripping prefixes.
 * Returns array of { value: prefixedTitle, label: strippedTitle } objects.
 */
export function getJobDropdownOptions(jobs, depId) {
  const filtered = filterJobsByDepartment(jobs, depId);
  return filtered.map(job => {
    const title = job.JOB_TITLE || job.job_title || '';
    return {
      value: title,
      label: stripJobPrefix(title)
    };
  });
}
