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
 * Parses .gitmodules content to extract submodule information.
 * @param {string} content - The content of the .gitmodules file.
 * @returns {Array<{path: string, url: string}>} Array of submodule objects.
 */
const parseGitmodules = (
  content: string
): Array<{ path: string; url: string }> => {
  console.log('[GitHub] Parsing .gitmodules file');
  const submodules: Array<{ path: string; url: string }> = [];
  const lines = content.split('\n');
  let currentSubmodule: { path?: string; url?: string } = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[submodule')) {
      // Start of a new submodule
      if (currentSubmodule.path && currentSubmodule.url) {
        submodules.push({
          path: currentSubmodule.path,
          url: currentSubmodule.url,
        });
      }
      currentSubmodule = {};
    } else if (trimmed.startsWith('path =')) {
      currentSubmodule.path = trimmed.substring(7).trim();
    } else if (trimmed.startsWith('url =')) {
      currentSubmodule.url = trimmed.substring(6).trim();
    }
  }

  // Add the last submodule if exists
  if (currentSubmodule.path && currentSubmodule.url) {
    submodules.push({
      path: currentSubmodule.path,
      url: currentSubmodule.url,
    });
  }

  console.log(`[GitHub] Found ${submodules.length} submodules:`, submodules);
  return submodules;
};

/**
 * Recursively fetches all .js files from a GitHub repository.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch to fetch from.
 * @param {string} basePath - The base path for constructing footprint names.
 * @returns {Promise<GitHubFootprint[]>} A promise that resolves with the list of footprints.
 */
const fetchFootprintsFromRepo = async (
  owner: string,
  repo: string,
  branch: string,
  basePath: string = ''
): Promise<GitHubFootprint[]> => {
  console.log(
    `[GitHub] Fetching footprints from repo ${owner}/${repo} (branch: ${branch}, path: ${basePath || 'root'})`
  );
  const footprints: GitHubFootprint[] = [];
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${basePath ? basePath : ''}?ref=${branch}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.log(
        `[GitHub] Failed to fetch from ${apiUrl}: ${response.status}`
      );
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
          console.log(`[GitHub] Loaded footprint: ${name}`);
          footprints.push({ name, content });
        }
      } else if (item.type === 'dir') {
        // Recursively fetch from subdirectory
        const subPath = basePath ? `${basePath}/${item.name}` : item.name;
        const subFootprints = await fetchFootprintsFromRepo(
          owner,
          repo,
          branch,
          subPath
        );
        footprints.push(...subFootprints);
      }
    }
  } catch (error) {
    console.warn('[GitHub] Failed to fetch footprints from repo:', error);
  }

  console.log(
    `[GitHub] Loaded ${footprints.length} footprints from ${owner}/${repo}`
  );
  return footprints;
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
  console.log(`[GitHub] Fetching footprints from directory: ${apiUrl}`);
  const footprints: GitHubFootprint[] = [];

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      // Directory doesn't exist or is inaccessible, return empty array
      console.log(`[GitHub] Directory not found or inaccessible: ${apiUrl}`);
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
          console.log(`[GitHub] Loaded footprint: ${name}`);
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
    console.warn('[GitHub] Failed to fetch footprints from directory:', error);
  }

  console.log(`[GitHub] Loaded ${footprints.length} footprints from directory`);
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
  console.log(`[GitHub] Starting fetch from URL: ${url}`);
  let newUrl = url.trim();

  const repoPattern = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+$/;
  if (repoPattern.test(newUrl)) {
    newUrl = `https://github.com/${newUrl}`;
  } else if (!newUrl.match(/^(https?:\/\/)/i)) {
    newUrl = `https://${newUrl}`;
  }

  const baseUrl = newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl;
  console.log(`[GitHub] Normalized URL: ${baseUrl}`);

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

    // Check if the file is named config.yaml to decide if we should look for footprints
    const filename = baseUrl.split('/').pop() || '';
    const shouldLoadFootprints = filename === 'config.yaml';

    if (!shouldLoadFootprints) {
      console.log(
        '[GitHub] File is not config.yaml, skipping footprint loading'
      );
      return { config, footprints: [], configPath: '' };
    }

    // For config.yaml files, try to fetch footprints from the same directory
    console.log(
      '[GitHub] Direct config.yaml link, attempting to load footprints'
    );

    // Extract owner, repo, branch, and path from the URL
    const urlMatch = baseUrl.match(
      /github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/
    );
    if (!urlMatch) {
      console.warn(
        '[GitHub] Could not parse direct file URL, skipping footprints'
      );
      return { config, footprints: [], configPath: '' };
    }

    const [, owner, repo, branch, filePath] = urlMatch;
    const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
    const footprintsPath = dirPath ? `${dirPath}/footprints` : 'footprints';
    console.log(`[GitHub] Looking for footprints in: ${footprintsPath}`);

    const footprintsApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${footprintsPath}?ref=${branch}`;
    const footprints = await fetchFootprintsFromDirectory(footprintsApiUrl);

    // Check for submodules
    console.log('[GitHub] Checking for .gitmodules file');
    try {
      const gitmodulesUrl = getRawUrl(
        `https://github.com/${owner}/${repo}/blob/${branch}/.gitmodules`
      );
      const gitmodulesResponse = await fetch(gitmodulesUrl);
      if (gitmodulesResponse.ok) {
        console.log('[GitHub] .gitmodules found, parsing submodules');
        const gitmodulesContent = await gitmodulesResponse.text();
        const submodules = parseGitmodules(gitmodulesContent);

        for (const submodule of submodules) {
          if (submodule.path.startsWith(footprintsPath)) {
            console.log(
              `[GitHub] Processing submodule: ${submodule.path} -> ${submodule.url}`
            );
            const submoduleMatch = submodule.url.match(
              /github\.com[/:]([^/]+)\/([^/.]+)/
            );
            if (submoduleMatch) {
              const [, subOwner, subRepo] = submoduleMatch;
              const relativePath = submodule.path.substring(
                footprintsPath.length + 1
              );
              console.log(`[GitHub] Submodule relative path: ${relativePath}`);

              let submoduleFootprints: GitHubFootprint[] = [];
              try {
                submoduleFootprints = await fetchFootprintsFromRepo(
                  subOwner,
                  subRepo,
                  'main',
                  ''
                );
              } catch (_e) {
                try {
                  submoduleFootprints = await fetchFootprintsFromRepo(
                    subOwner,
                    subRepo,
                    'master',
                    ''
                  );
                } catch (_e2) {
                  console.warn(
                    `Failed to fetch submodule footprints from ${submodule.url}`
                  );
                }
              }

              const prefixedFootprints = submoduleFootprints.map((fp) => ({
                name: relativePath ? `${relativePath}/${fp.name}` : fp.name,
                content: fp.content,
              }));
              console.log(
                `[GitHub] Added ${prefixedFootprints.length} footprints from submodule ${submodule.path}`
              );
              footprints.push(...prefixedFootprints);
            }
          } else {
            console.log(
              `[GitHub] Skipping submodule (not in footprints): ${submodule.path}`
            );
          }
        }
      } else {
        console.log('[GitHub] No .gitmodules file found');
      }
    } catch (error) {
      console.warn('[GitHub] Error checking for .gitmodules:', error);
    }

    console.log(
      `[GitHub] Loaded ${footprints.length} footprints from direct link`
    );
    return { config, footprints, configPath: dirPath };
  }

  /**
   * Performs a breadth-first search to find YAML files in a repository.
   * @param {string} owner - Repository owner.
   * @param {string} repo - Repository name.
   * @param {string} branch - Branch to search.
   * @returns {Promise<{configYamls: {path: string, content: string}[], anyYamls: {path: string, content: string}[]}>}
   */
  const bfsForYamlFiles = async (
    owner: string,
    repo: string,
    branch: string
  ): Promise<{
    configYamls: { path: string; content: string }[];
    anyYamls: { path: string; content: string }[];
  }> => {
    const configYamls: { path: string; content: string }[] = [];
    const anyYamls: { path: string; content: string }[] = [];
    const queue: string[] = [''];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      if (visited.has(currentPath)) continue;
      visited.add(currentPath);

      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${currentPath}?ref=${branch}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) continue;

        const items = await response.json();
        if (!Array.isArray(items)) continue;

        for (const item of items) {
          if (item.type === 'file' && item.name.endsWith('.yaml')) {
            const fileResponse = await fetch(item.download_url);
            if (fileResponse.ok) {
              const content = await fileResponse.text();
              const filePath = item.path;

              if (item.name === 'config.yaml') {
                configYamls.push({ path: filePath, content });
              } else {
                anyYamls.push({ path: filePath, content });
              }
            }
          } else if (item.type === 'dir') {
            queue.push(item.path);
          }
        }
      } catch (_error) {
        // Continue searching other directories
        continue;
      }
    }

    return { configYamls, anyYamls };
  };

  /**
   * Attempts to fetch `config.yaml` and footprints from standard locations within a specific branch of a repository.
   * @param {string} branch - The branch to check (e.g., 'main', 'master').
   * @returns {Promise<GitHubLoadResult>} A promise that resolves with the config, footprints, and config path.
   * @throws {Error} Throws an error if the file cannot be fetched from any location in the branch.
   */
  const fetchWithBranch = async (branch: string): Promise<GitHubLoadResult> => {
    console.log(`[GitHub] Attempting to fetch from branch: ${branch}`);
    // Extract owner and repo from baseUrl
    const urlObject = new URL(baseUrl);
    const [, owner, repo] = urlObject.pathname.split('/');
    console.log(`[GitHub] Repository: ${owner}/${repo}`);

    let configPath = '';
    let config = '';
    let shouldLoadFootprints = true;

    // First, try the root directory
    const rootUrl = getRawUrl(`${baseUrl}/blob/${branch}/config.yaml`);
    let response = await fetch(rootUrl);

    if (response.ok) {
      config = await response.text();
      configPath = '';
      console.log('[GitHub] Config found in root directory');
    } else if (response.status === 400 || response.status === 404) {
      // Try the /ergogen/ directory
      const ergogenUrl = getRawUrl(
        `${baseUrl}/blob/${branch}/ergogen/config.yaml`
      );
      response = await fetch(ergogenUrl);

      if (response.ok) {
        config = await response.text();
        configPath = 'ergogen';
        console.log('[GitHub] Config found in ergogen/ directory');
      } else {
        // Perform breadth-first search for YAML files
        console.log('[GitHub] Performing breadth-first search for YAML files');
        const { configYamls, anyYamls } = await bfsForYamlFiles(
          owner,
          repo,
          branch
        );

        if (configYamls.length > 0) {
          // Use the first config.yaml found
          const firstConfig = configYamls[0];
          config = firstConfig.content;
          configPath = firstConfig.path.substring(
            0,
            firstConfig.path.lastIndexOf('/')
          );
          console.log(`[GitHub] Found config.yaml at: ${firstConfig.path}`);

          if (configYamls.length > 1) {
            console.log(
              `[GitHub] Multiple config.yaml files found, using first: ${firstConfig.path}`
            );
          }
        } else if (anyYamls.length > 0) {
          // No config.yaml found, use first .yaml file
          const firstYaml = anyYamls[0];
          config = firstYaml.content;
          configPath = firstYaml.path.substring(
            0,
            firstYaml.path.lastIndexOf('/')
          );
          shouldLoadFootprints = false;
          console.log(
            `[GitHub] No config.yaml found, using: ${firstYaml.path}`
          );
        } else {
          // No YAML files found at all
          throw new Error('No YAML configuration files found in repository');
        }
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Only load footprints if we found a config.yaml file
    if (!shouldLoadFootprints) {
      console.log(
        '[GitHub] Skipping footprint loading for non-config.yaml file'
      );
      return { config, footprints: [], configPath };
    }

    // Now fetch footprints from the footprints folder
    const footprintsPath = configPath
      ? `${configPath}/footprints`
      : 'footprints';
    console.log(`[GitHub] Looking for footprints in: ${footprintsPath}`);
    const footprintsApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${footprintsPath}?ref=${branch}`;
    const footprints = await fetchFootprintsFromDirectory(footprintsApiUrl);

    // Check for .gitmodules to handle submodules
    console.log('[GitHub] Checking for .gitmodules file');
    try {
      const gitmodulesUrl = getRawUrl(`${baseUrl}/blob/${branch}/.gitmodules`);
      const gitmodulesResponse = await fetch(gitmodulesUrl);
      if (gitmodulesResponse.ok) {
        console.log('[GitHub] .gitmodules found, parsing submodules');
        const gitmodulesContent = await gitmodulesResponse.text();
        const submodules = parseGitmodules(gitmodulesContent);

        // Filter submodules that are within the footprints folder
        for (const submodule of submodules) {
          if (submodule.path.startsWith(footprintsPath)) {
            console.log(
              `[GitHub] Processing submodule: ${submodule.path} -> ${submodule.url}`
            );
            // Extract owner and repo from submodule URL
            const submoduleMatch = submodule.url.match(
              /github\.com[/:]([^/]+)\/([^/.]+)/
            );
            if (submoduleMatch) {
              const [, subOwner, subRepo] = submoduleMatch;
              // Calculate the relative path for naming
              const relativePath = submodule.path.substring(
                footprintsPath.length + 1
              );
              console.log(`[GitHub] Submodule relative path: ${relativePath}`);
              // Try both main and master branches for the submodule
              let submoduleFootprints: GitHubFootprint[] = [];
              try {
                submoduleFootprints = await fetchFootprintsFromRepo(
                  subOwner,
                  subRepo,
                  'main',
                  ''
                );
              } catch (_e) {
                try {
                  submoduleFootprints = await fetchFootprintsFromRepo(
                    subOwner,
                    subRepo,
                    'master',
                    ''
                  );
                } catch (_e2) {
                  console.warn(
                    `Failed to fetch submodule footprints from ${submodule.url}`
                  );
                }
              }
              // Prefix the footprint names with the relative path
              const prefixedFootprints = submoduleFootprints.map((fp) => ({
                name: relativePath ? `${relativePath}/${fp.name}` : fp.name,
                content: fp.content,
              }));
              console.log(
                `[GitHub] Added ${prefixedFootprints.length} footprints from submodule ${submodule.path}`
              );
              footprints.push(...prefixedFootprints);
            }
          } else {
            console.log(
              `[GitHub] Skipping submodule (not in footprints): ${submodule.path}`
            );
          }
        }
      } else {
        console.log('[GitHub] No .gitmodules file found');
      }
    } catch (error) {
      // .gitmodules doesn't exist or couldn't be parsed, continue without submodules
      console.warn('[GitHub] No .gitmodules found or failed to parse:', error);
    }

    console.log(`[GitHub] Total footprints loaded: ${footprints.length}`);
    return { config, footprints, configPath };
  };

  // Try fetching from the 'main' branch first, then fall back to 'master'.
  try {
    return await fetchWithBranch('main');
  } catch (_e) {
    return await fetchWithBranch('master');
  }
};
