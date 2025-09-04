export const getRawUrl = (url: string) => {
    const rawUrl = url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    return rawUrl;
};

export const fetchConfigFromUrl = (url: string) => {
    return fetch(getRawUrl(url))
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
};
