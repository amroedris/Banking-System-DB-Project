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

/**
 * Filters jobs based on what the logged-in user can assign.
 * jobId: The JOB_ID of the current logged-in user (1=Dept Mgr, 2=Teller, 3=IT Admin, 4=Branch Mgr)
 * Returns filtered array of job objects.
 */
export function filterJobsByPermission(jobs, jobId) {
  if (jobId === 3) {
    return jobs; // IT Admin can see all roles
  }
  if (jobId === 4) {
    // Branch Manager can assign: Dept Manager (1) and Teller (2)
    return jobs.filter(job => {
      const id = job.JOB_ID || job.job_id;
      return id === 1 || id === 2;
    });
  }
  // Dept Manager (1) and others: only Teller
  return jobs.filter(job => {
    const title = job.JOB_TITLE || job.job_title || '';
    return title === 'RB_Teller';
  });
}

/**
 * Role hierarchy: higher rank = more authority.
 * Admin (3) rank=4, Branch Manager (4) rank=3, Dept Manager (1) rank=2, Teller (2) rank=1
 */
export const ROLE_RANK = { 3: 4, 4: 3, 1: 2, 2: 1 };

/**
 * Returns true if a person with supervisorJobId can supervise a person with targetJobId.
 */
export function canSupervise(supervisorJobId, targetJobId) {
  return (ROLE_RANK[supervisorJobId] || 0) > (ROLE_RANK[targetJobId] || 0);
}

/**
 * Returns array of JOB_IDs that are higher-ranked than the given jobId.
 */
export function getSupervisorJobIds(targetJobId) {
  const targetRank = ROLE_RANK[targetJobId] || 0;
  return Object.entries(ROLE_RANK)
    .filter(([_, rank]) => rank > targetRank)
    .map(([id]) => Number(id));
}

/**
 * Gets job dropdown options filtered by user permission.
 */
export function getJobDropdownOptionsByPermission(jobs, jobId, depId) {
  const permissionFiltered = filterJobsByPermission(jobs, jobId);
  const byDepartment = filterJobsByDepartment(permissionFiltered, depId);
  return byDepartment.map(job => {
    const title = job.JOB_TITLE || job.job_title || '';
    return {
      value: title,
      label: stripJobPrefix(title)
    };
  });
}
