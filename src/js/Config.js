/**
 * @namespace
 */
mindmaps.Config = (function() {
  /**
   * Public API
   * @scope mindmaps.Config
   */
  return {
    // The URL of the storage server used in ServerStorage.
    serverStorageUrl: "http://localhost:3000/",

    // Configuration for node URLs.
    activateDirectUrlInput: true,
    activateUrlsFromServerWithoutSearch: true,
    activateUrlsFromServerWithSearch: true,

    allowMultipleUrls: true,

    urlServerAddress: "http://localhost:3001/"
  };
})();