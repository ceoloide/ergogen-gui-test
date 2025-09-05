export const getRawUrl = (url: string) => {
    const rawUrl = url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    return rawUrl;
};

export const fetchConfigFromUrl = async (url: string): Promise<string> => {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

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

    if (!isRepoRoot(baseUrl)) {
        const response = await fetch(getRawUrl(baseUrl));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    }

    const fetchWithBranch = async (branch: string): Promise<string> => {
        const firstUrl = getRawUrl(`${baseUrl}/blob/${branch}/config.yaml`);
        let response = await fetch(firstUrl);

        if (response.ok) {
            return response.text();
        }

        if (response.status === 400 || response.status === 404) {
            const secondUrl = getRawUrl(`${baseUrl}/blob/${branch}/ergogen/config.yaml`);
            response = await fetch(secondUrl);
            if (response.ok) {
                return response.text();
            }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
        return await fetchWithBranch('main');
    } catch (e) {
        return await fetchWithBranch('master');
    }
};
