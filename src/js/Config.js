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
    storageServerAddress: "http://localhost:3000/",

    // Methods of attaching URLs to a node. Deactive all to disallow attaching
    // URLs to nodes.
    activateDirectUrlInput: true,
    activateUrlsFromServerWithoutSearch: true,
    activateUrlsFromServerWithSearch: true,

    // Can multiple URLs be attached to a node?
    allowMultipleUrls: true,

    // Address of the URL server.
    urlServerAddress: "http://localhost:3001/"
  };
})();
