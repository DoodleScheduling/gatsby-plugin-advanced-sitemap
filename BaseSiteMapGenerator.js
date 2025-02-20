"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _xml = _interopRequireDefault(require("xml"));

var _moment = _interopRequireDefault(require("moment"));

var _path = _interopRequireDefault(require("path"));

var utils = _interopRequireWildcard(require("./utils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Sitemap specific xml namespace declarations that should not change
var XMLNS_DECLS = {
  _attr: {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
    'xmlns:image': "http://www.google.com/schemas/sitemap-image/1.1"
  }
};

var BaseSiteMapGenerator = /*#__PURE__*/function () {
  function BaseSiteMapGenerator() {
    this.nodeLookup = {};
    this.nodeTimeLookup = {};
    this.siteMapContent = null;
    this.lastModified = 0;
  }

  var _proto = BaseSiteMapGenerator.prototype;

  _proto.generateXmlFromNodes = function generateXmlFromNodes(options) {
    var self = this; // Get a mapping of node to timestamp

    var timedNodes = _lodash.default.map(this.nodeLookup, function (node, id) {
      return {
        id: id,
        // Using negative here to sort newest to oldest
        ts: -(self.nodeTimeLookup[id] || 0),
        node: node
      };
    }, []); // Sort nodes by timestamp


    var sortedNodes = _lodash.default.sortBy(timedNodes, "ts"); // Grab just the nodes


    var urlElements = _lodash.default.map(sortedNodes, "node");

    var data = {
      // Concat the elements to the _attr declaration
      urlset: [XMLNS_DECLS].concat(urlElements)
    }; // Return the xml

    return utils.sitemapsUtils.getDeclarations(options) + (0, _xml.default)(data);
  };

  _proto.addUrl = function addUrl(url, datum) {
    var node = this.createUrlNodeFromDatum(url, datum);

    if (node) {
      this.updateLastModified(datum);
      this.updateLookups(datum, node); // force regeneration of xml

      this.siteMapContent = null;
    }
  };

  _proto.removeUrl = function removeUrl(url, datum) {
    this.removeFromLookups(datum); // force regeneration of xml

    this.siteMapContent = null;
    this.lastModified = (0, _moment.default)(new Date());
  };

  _proto.getLastModifiedForDatum = function getLastModifiedForDatum(datum) {
    if (datum.updated_at || datum.published_at || datum.created_at) {
      var modifiedDate = datum.updated_at || datum.published_at || datum.created_at;
      return (0, _moment.default)(new Date(modifiedDate));
    } else {
      return (0, _moment.default)(new Date());
    }
  };

  _proto.updateLastModified = function updateLastModified(datum) {
    var lastModified = this.getLastModifiedForDatum(datum);

    if (!this.lastModified || lastModified > this.lastModified) {
      this.lastModified = lastModified;
    }
  };

  _proto.createUrlNodeFromDatum = function createUrlNodeFromDatum(url, datum) {
    var node, imgNode;
    node = {
      url: [{
        loc: url
      }, {
        lastmod: (0, _moment.default)(this.getLastModifiedForDatum(datum), _moment.default.ISO_8601).toISOString()
      }]
    };
    imgNode = this.createImageNodeFromDatum(datum);

    if (imgNode) {
      node.url.push(imgNode);
    }

    return node;
  };

  _proto.createImageNodeFromDatum = function createImageNodeFromDatum(datum) {
    // Check for cover first because user has cover but the rest only have image
    var image = datum.cover_image || datum.profile_image || datum.feature_image;
    var imageEl;

    if (!image) {
      return;
    } // Create the weird xml node syntax structure that is expected


    imageEl = [{
      'image:loc': image
    }, {
      'image:caption': _path.default.basename(image)
    }]; // Return the node to be added to the url xml node

    return {
      'image:image': imageEl
    }; //eslint-disable-line
  };

  _proto.validateImageUrl = function validateImageUrl(imageUrl) {
    return !!imageUrl;
  };

  _proto.getXml = function getXml(options) {
    if (this.siteMapContent) {
      return this.siteMapContent;
    }

    var content = this.generateXmlFromNodes(options);
    this.siteMapContent = content;
    return content;
  }
  /**
   * @NOTE
   * The url service currently has no url update event.
   * It removes and adds the url. If the url service extends it's
   * feature set, we can detect if a node has changed.
   */
  ;

  _proto.updateLookups = function updateLookups(datum, node) {
    this.nodeLookup[datum.id] = node;
    this.nodeTimeLookup[datum.id] = this.getLastModifiedForDatum(datum);
  };

  _proto.removeFromLookups = function removeFromLookups(datum) {
    delete this.nodeLookup[datum.id];
    delete this.nodeTimeLookup[datum.id];
  };

  _proto.reset = function reset() {
    this.nodeLookup = {};
    this.nodeTimeLookup = {};
    this.siteMapContent = null;
  };

  return BaseSiteMapGenerator;
}();

exports.default = BaseSiteMapGenerator;