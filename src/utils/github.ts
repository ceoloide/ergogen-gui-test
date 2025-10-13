/**
 * Converts a standard GitHub file URL to its corresponding raw content URL.
 * @param {string} url - The GitHub URL (e.g., "https://github.com/user/repo/blob/main/file.txt").
 * @returns {string} The raw content URL (e.g., "https://raw.githubusercontent.com/user/repo/main/file.txt").
 */
const getRawUrl = (url: string) => {
  const rawUrl = url
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/');
  return rawUrl;
};

/**
 * Represents a footprint loaded from GitHub.
 */
export type GitHubFootprint = {
  name: string;
  content: string;
};

/**
 * Represents the result of loading from GitHub, including config and footprints.
 */
export type GitHubLoadResult = {
  config: string;
  footprints: GitHubFootprint[];
  configPath: string;
};

/**
 * Recursively fetches all .js files from a GitHub directory and its subdirectories.
 * @param {string} apiUrl - The GitHub API URL for the directory.
 * @param {string} basePath - The base path for constructing footprint names.
 * @returns {Promise<GitHubFootprint[]>} A promise that resolves with the list of footprints.
 */
const fetchFootprintsFromDirectory = async (
  apiUrl: string,
  basePath: string = ''
): Promise<GitHubFootprint[]> => {
  const footprints: GitHubFootprint[] = [];

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      // Directory doesn't exist or is inaccessible, return empty array
      return footprints;
    }

    const items = await response.json();

    for (const item of items) {
      if (item.type === 'file' && item.name.endsWith('.js')) {
        // Fetch the content of the .js file
        const contentResponse = await fetch(item.download_url);
        if (contentResponse.ok) {
          const content = await contentResponse.text();
          // Construct the footprint name from path and filename without extension
          const fileName = item.name.replace(/\.js$/, '');
          const name = basePath ? `${basePath}/${fileName}` : fileName;
          footprints.push({ name, content });
        }
      } else if (item.type === 'dir') {
        // Recursively fetch from subdirectory
        const subPath = basePath ? `${basePath}/${item.name}` : item.name;
        const subFootprints = await fetchFootprintsFromDirectory(
          item.url,
          subPath
        );
        footprints.push(...subFootprints);
      }
    }
  } catch (error) {
    // Silently fail if directory doesn't exist or can't be accessed
    console.warn('Failed to fetch footprints from directory:', error);
  }

  return footprints;
};

/**
 * Fetches a configuration file (`config.yaml`) from a given GitHub URL.
 * It handles repository root URLs and direct file URLs, automatically trying common branches ('main', 'master')
 * and locations (`/config.yaml`, `/ergogen/config.yaml`).
 * Also attempts to load footprints from a `footprints` folder alongside the config file.
 * @param {string} url - The GitHub URL to fetch the configuration from.
 * @returns {Promise<GitHubLoadResult>} A promise that resolves with the config content, footprints, and config path.
 * @throws {Error} Throws an error if the fetch fails for all attempted locations.
 */
export const fetchConfigFromUrl = async (
  url: string
): Promise<GitHubLoadResult> => {
  let newUrl = url.trim();

  const repoPattern = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+$/;
  if (repoPattern.test(newUrl)) {
    newUrl = `https://github.com/${newUrl}`;
  } else if (!newUrl.match(/^(https?:\/\/)/i)) {
    newUrl = `https://${newUrl}`;
  }

  const baseUrl = newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl;

  /**
   * Checks if a given URL points to the root of a GitHub repository.
   * @param {string} url - The URL to check.
   * @returns {boolean} True if the URL is a GitHub repository root, false otherwise.
   */
  const isRepoRoot = (url: string) => {
    try {
      const urlObject = new URL(url);
      if (urlObject.hostname !== 'github.com') {
        return false;
      }

      const pathSegments = urlObject.pathname.split('/').filter(Boolean);
      if (pathSegments.length !== 2) {
        return false;
      }

      const reservedFirstSegments = [
        'topics',
        'trending',
        'sponsors',
        'issues',
        'pulls',
        'new',
        'orgs',
        'users',
        'search',
        'marketplace',
        'explore',
        'settings',
        'notifications',
        'discussions',
        'codespaces',
        'organizations',
      ];
      if (reservedFirstSegments.includes(pathSegments[0].toLowerCase())) {
        return false;
      }

      return true;
    } catch (_e) {
      return false;
    }
  };

  // If the URL is not a repository root, assume it's a direct file link.
  if (!isRepoRoot(baseUrl)) {
    const response = await fetch(getRawUrl(baseUrl));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.text();
    // For direct file links, we don't fetch footprints
    return { config, footprints: [], configPath: '' };
  }

  /**
   * Attempts to fetch `config.yaml` and footprints from standard locations within a specific branch of a repository.
   * @param {string} branch - The branch to check (e.g., 'main', 'master').
   * @returns {Promise<GitHubLoadResult>} A promise that resolves with the config, footprints, and config path.
   * @throws {Error} Throws an error if the file cannot be fetched from any location in the branch.
   */
  const fetchWithBranch = async (branch: string): Promise<GitHubLoadResult> => {
    // Extract owner and repo from baseUrl
    const urlObject = new URL(baseUrl);
    const [, owner, repo] = urlObject.pathname.split('/');

    // First, try the root directory
    const firstUrl = getRawUrl(`${baseUrl}/blob/${branch}/config.yaml`);
    let response = await fetch(firstUrl);
    let configPath = '';
    let config = '';

    if (response.ok) {
      config = await response.text();
      configPath = '';
    } else if (response.status === 400 || response.status === 404) {
      // If not found, try the /ergogen/ directory
      const secondUrl = getRawUrl(
        `${baseUrl}/blob/${branch}/ergogen/config.yaml`
      );
      response = await fetch(secondUrl);
      if (response.ok) {
        config = await response.text();
        configPath = 'ergogen';
      } else {
        // If still not found or another error occurred, throw.
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Now fetch footprints from the footprints folder
    const footprintsPath = configPath
      ? `${configPath}/footprints`
      : 'footprints';
    const footprintsApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${footprintsPath}?ref=${branch}`;
    const footprints = await fetchFootprintsFromDirectory(footprintsApiUrl);

    return { config, footprints, configPath };
  };

  // Try fetching from the 'main' branch first, then fall back to 'master'.
  try {
    return await fetchWithBranch('main');
  } catch (_e) {
    return await fetchWithBranch('master');
  }
};
