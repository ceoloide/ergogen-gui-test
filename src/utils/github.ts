/**
 * Converts a standard GitHub file URL to its corresponding raw content URL.
 * @param {string} url - The GitHub URL (e.g., "https://github.com/user/repo/blob/main/file.txt").
 * @returns {string} The raw content URL (e.g., "https://raw.githubusercontent.com/user/repo/main/file.txt").
 */
export const getRawUrl = (url: string) => {
    const rawUrl = url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    return rawUrl;
};

/**
 * Fetches a configuration file (`config.yaml`) from a given GitHub URL.
 * It handles repository root URLs and direct file URLs, automatically trying common branches ('main', 'master')
 * and locations (`/config.yaml`, `/ergogen/config.yaml`).
 * @param {string} url - The GitHub URL to fetch the configuration from.
 * @returns {Promise<string>} A promise that resolves with the text content of the configuration file.
 * @throws {Error} Throws an error if the fetch fails for all attempted locations.
 */
export const fetchConfigFromUrl = async (url: string): Promise<string> => {
    let newUrl = url.trim();
    if (!newUrl.match(/^(https?:\/\/)/i)) {
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
                'topics', 'trending', 'sponsors', 'issues', 'pulls', 'new',
                'orgs', 'users', 'search', 'marketplace', 'explore', 'settings',
                'notifications', 'discussions', 'codespaces', 'organizations'
            ];
            if (reservedFirstSegments.includes(pathSegments[0].toLowerCase())) {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    };

    // If the URL is not a repository root, assume it's a direct file link.
    if (!isRepoRoot(baseUrl)) {
        const response = await fetch(getRawUrl(baseUrl));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    }

    /**
     * Attempts to fetch `config.yaml` from standard locations within a specific branch of a repository.
     * @param {string} branch - The branch to check (e.g., 'main', 'master').
     * @returns {Promise<string>} A promise that resolves with the file content if found.
     * @throws {Error} Throws an error if the file cannot be fetched from any location in the branch.
     */
    const fetchWithBranch = async (branch: string): Promise<string> => {
        // First, try the root directory
        const firstUrl = getRawUrl(`${baseUrl}/blob/${branch}/config.yaml`);
        let response = await fetch(firstUrl);

        if (response.ok) {
            return response.text();
        }

        // If not found, try the /ergogen/ directory
        if (response.status === 400 || response.status === 404) {
            const secondUrl = getRawUrl(`${baseUrl}/blob/${branch}/ergogen/config.yaml`);
            response = await fetch(secondUrl);
            if (response.ok) {
                return response.text();
            }
        }
        // If still not found or another error occurred, throw.
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Try fetching from the 'main' branch first, then fall back to 'master'.
    try {
        return await fetchWithBranch('main');
    } catch (e) {
        return await fetchWithBranch('master');
    }
};
