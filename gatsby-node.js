"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _url = _interopRequireDefault(require("url"));

var _lodash = _interopRequireDefault(require("lodash"));

var _defaults = _interopRequireDefault(require("./defaults"));

var _SiteMapManager = _interopRequireDefault(require("./SiteMapManager"));

var utils = _interopRequireWildcard(require("./utils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var PUBLICPATH = "./public";
var RESOURCESFILE = "/sitemap-:resource.xml";

var XSLFILE = _path.default.resolve(__dirname, "./static/sitemap.xsl");

var DEFAULTQUERY = "{\n  allSitePage {\n    edges {\n      node {\n        id\n        slug: path\n        url: path\n      }\n    }\n  }\n  site {\n    siteMetadata {\n      siteUrl\n    }\n  }\n}";
var DEFAULTMAPPING = {
  allSitePage: {
    sitemap: "pages"
  }
};
var siteURL;

var copyStylesheet = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(_ref) {
    var siteUrl, indexOutput, siteRegex, data, sitemapStylesheet;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            siteUrl = _ref.siteUrl, indexOutput = _ref.indexOutput;
            siteRegex = /(\{\{blog-url\}\})/g; // Get our stylesheet template

            _context.next = 4;
            return utils.readFile(XSLFILE);

          case 4:
            data = _context.sent;
            // Replace the `{{blog-url}}` variable with our real site URL
            sitemapStylesheet = data.toString().replace(siteRegex, _url.default.resolve(siteUrl, indexOutput)); // Save the updated stylesheet to the public folder, so it will be
            // available for the xml sitemap files

            _context.next = 8;
            return utils.writeFile(_path.default.join(PUBLICPATH, "sitemap.xsl"), sitemapStylesheet);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function copyStylesheet(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var serializeMarkdownNodes = function serializeMarkdownNodes(node) {
  if (!node.slug && !node.fields.slug) {
    throw Error("`slug` is a required field");
  }

  if (!node.slug) {
    node.slug = node.fields.slug;
    delete node.fields.slug;
  }

  if (node.frontmatter) {
    if (node.frontmatter.published_at) {
      node.published_at = node.frontmatter.published_at;
      delete node.frontmatter.published_at;
    }

    if (node.frontmatter.feature_image) {
      node.feature_image = node.frontmatter.feature_image;
      delete node.frontmatter.feature_image;
    }
  }

  return node;
}; // Compare our node paths with the ones that Gatsby has generated and updated them
// with the "real" used ones.


var getNodePath = function getNodePath(node, allSitePage) {
  if (!node.path || node.path === "/") {
    return node;
  }

  var slugRegex = new RegExp(node.path.replace(/\/$/, "") + "$", "gi");

  for (var _iterator = _createForOfIteratorHelperLoose(allSitePage.edges), _step; !(_step = _iterator()).done;) {
    var _page$node;

    var page = _step.value;

    if (page !== null && page !== void 0 && (_page$node = page.node) !== null && _page$node !== void 0 && _page$node.url && page.node.url.replace(/\/$/, "").match(slugRegex)) {
      node.path = page.node.url;
      break;
    }
  }

  return node;
}; // Add all other URLs that Gatsby generated, using siteAllPage,
// but we didn't fetch with our queries


var addPageNodes = function addPageNodes(parsedNodesArray, allSiteNodes, siteUrl) {
  var parsedNodes = parsedNodesArray[0];
  var pageNodes = [];
  var addedPageNodes = {
    pages: []
  };
  var usedNodes = allSiteNodes.filter(function (_ref3) {
    var node = _ref3.node;
    var foundOne;

    for (var type in parsedNodes) {
      parsedNodes[type].forEach(function (fetchedNode) {
        if (node.url === fetchedNode.node.path) {
          foundOne = true;
        }
      });
    }

    return foundOne;
  });

  var remainingNodes = _lodash.default.difference(allSiteNodes, usedNodes);

  remainingNodes.forEach(function (_ref4) {
    var node = _ref4.node;
    addedPageNodes.pages.push({
      url: _url.default.resolve(siteUrl, node.url),
      node: node
    });
  });
  pageNodes.push(addedPageNodes);
  return pageNodes;
};

var serializeSources = function serializeSources(_ref5) {
  var mapping = _ref5.mapping,
      _ref5$additionalSitem = _ref5.additionalSitemaps,
      additionalSitemaps = _ref5$additionalSitem === void 0 ? [] : _ref5$additionalSitem;
  var sitemaps = [];

  for (var resourceType in mapping) {
    sitemaps.push(mapping[resourceType]);
  }

  sitemaps = _lodash.default.map(sitemaps, function (source) {
    // Ignore the key and only return the name and
    // source as we need those to create the index
    // and the belonging sources accordingly
    return {
      name: source.name || source.sitemap,
      sitemap: source.sitemap || "pages"
    };
  });

  if (Array.isArray(additionalSitemaps)) {
    additionalSitemaps.forEach(function (addSitemap, index) {
      if (!addSitemap.url) {
        throw new Error("URL is required for additional Sitemap: ", addSitemap);
      }

      sitemaps.push({
        name: "external-" + (addSitemap.name || addSitemap.sitemap || "pages-" + index),
        url: addSitemap.url
      });
    });
  }

  sitemaps = _lodash.default.uniqBy(sitemaps, "name");
  return sitemaps;
};

var runQuery = function runQuery(handler, _ref6) {
  var query = _ref6.query,
      mapping = _ref6.mapping,
      exclude = _ref6.exclude;
  return handler(query).then(function (r) {
    if (r.errors) {
      throw new Error(r.errors.join(", "));
    }

    var _loop = function _loop(source) {
      var _mapping$source, _r$data, _r$data$source;

      // Check for custom serializer
      if (typeof (mapping === null || mapping === void 0 ? void 0 : (_mapping$source = mapping[source]) === null || _mapping$source === void 0 ? void 0 : _mapping$source.serializer) === "function") {
        if (r.data[source] && Array.isArray(r.data[source].edges)) {
          var serializedEdges = mapping[source].serializer(r.data[source].edges);

          if (!Array.isArray(serializedEdges)) {
            throw new Error("Custom sitemap serializer must return an array");
          }

          r.data[source].edges = serializedEdges;
        }
      } // Removing excluded paths


      if ((_r$data = r.data) !== null && _r$data !== void 0 && (_r$data$source = _r$data[source]) !== null && _r$data$source !== void 0 && _r$data$source.edges && r.data[source].edges.length) {
        r.data[source].edges = r.data[source].edges.filter(function (_ref7) {
          var node = _ref7.node;
          return !exclude.some(function (excludedRoute) {
            var _node$fields;

            var sourceType = node.__typename ? "all" + node.__typename : source;
            var slug = sourceType === "allMarkdownRemark" || sourceType === "allMdx" || node !== null && node !== void 0 && (_node$fields = node.fields) !== null && _node$fields !== void 0 && _node$fields.slug ? node.fields.slug.replace(/^\/|\/$/, "") : node.slug.replace(/^\/|\/$/, "");
            excludedRoute = typeof excludedRoute === "object" ? excludedRoute : excludedRoute.replace(/^\/|\/$/, ""); // test if the passed regular expression is valid

            if (typeof excludedRoute === "object") {
              var excludedRouteIsValidRegEx = true;

              try {
                new RegExp(excludedRoute);
              } catch (e) {
                excludedRouteIsValidRegEx = false;
              }

              if (!excludedRouteIsValidRegEx) {
                throw new Error("Excluded route is not a valid RegExp: ", excludedRoute);
              }

              return excludedRoute.test(slug);
            } else {
              return slug.indexOf(excludedRoute) >= 0;
            }
          });
        });
      }
    };

    for (var source in r.data) {
      _loop(source);
    }

    return r.data;
  });
};

var serialize = function serialize(_temp, _ref8, _ref9) {
  var _ref10 = _temp === void 0 ? {} : _temp,
      sources = (0, _extends2.default)({}, _ref10);

  var site = _ref8.site,
      allSitePage = _ref8.allSitePage;
  var mapping = _ref9.mapping,
      addUncaughtPages = _ref9.addUncaughtPages;
  var nodes = [];
  var sourceObject = {};
  siteURL = site.siteMetadata.siteUrl;

  var _loop2 = function _loop2(type) {
    var _mapping$type;

    if (mapping !== null && mapping !== void 0 && (_mapping$type = mapping[type]) !== null && _mapping$type !== void 0 && _mapping$type.sitemap) {
      var currentSource = sources[type] ? sources[type] : [];

      if (currentSource) {
        sourceObject[mapping[type].sitemap] = sourceObject[mapping[type].sitemap] || [];
        currentSource.edges.map(function (_ref11) {
          var node = _ref11.node;

          if (!node) {
            return;
          }

          var nodeType = node.__typename ? "all" + node.__typename : type;

          if (nodeType === "allMarkdownRemark" || nodeType === "allMdx") {
            node = serializeMarkdownNodes(node);
          } // if a mapping path is set, e. g. `/blog/tag` for tags, update the path
          // to reflect this. This prevents mapping issues, when we later update
          // the path with the Gatsby generated one in `getNodePath`


          if (mapping[type].path) {
            node.path = _path.default.resolve(mapping[type].path, node.slug);
          } else {
            node.path = node.slug;
          }

          if (typeof mapping[type].prefix === "string" && mapping[type].prefix !== "") {
            node.path = mapping[type].prefix + node.path;
          } // get the real path for the node, which is generated by Gatsby


          node = getNodePath(node, allSitePage);
          sourceObject[mapping[type].sitemap].push({
            url: _url.default.resolve(siteURL, node.path),
            node: node
          });
        });
      }
    }
  };

  for (var type in sources) {
    _loop2(type);
  }

  nodes.push(sourceObject); // Get all additionally created page URLs that have been generated by Gatsby

  if (addUncaughtPages) {
    var pageNodes = addPageNodes(nodes, allSitePage.edges, siteURL);

    if (pageNodes[0].pages && pageNodes[0].pages.length > 0) {
      if (nodes[0].pages) {
        nodes[0].pages = nodes[0].pages.concat(pageNodes[0].pages);
      } else {
        nodes[0].pages = pageNodes[0].pages;
      }
    }
  }

  nodes[0].pages = _lodash.default.uniqBy(nodes[0].pages, "url");
  return nodes;
};

exports.onPostBuild = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(_ref12, pluginOptions) {
    var graphql, queryRecords, options, indexSitemapFile, resourcesSitemapFile, defaultQueryRecords, manager, resourcesSiteMapsArray, indexSiteMap, _i, _resourcesSiteMapsArr, sitemap, filePath;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            graphql = _ref12.graphql;
            // Passing the config option addUncaughtPages will add all pages which are not covered by passed mappings
            // to the default `pages` sitemap. Otherwise they will be ignored.
            options = pluginOptions.addUncaughtPages ? _lodash.default.merge(_defaults.default, pluginOptions) : Object.assign({}, _defaults.default, pluginOptions);
            indexSitemapFile = _path.default.join(PUBLICPATH, options.output);
            resourcesSitemapFile = _path.default.join(PUBLICPATH, RESOURCESFILE);
            delete options.plugins;
            delete options.createLinkInHead;
            options.indexOutput = options.output;
            options.resourcesOutput = RESOURCESFILE; // We always query siteAllPage as well as the site query to
            // get data we need and to also allow not passing any custom
            // query or mapping

            _context2.next = 10;
            return runQuery(graphql, {
              query: DEFAULTQUERY,
              exclude: options.exclude
            });

          case 10:
            defaultQueryRecords = _context2.sent;

            if (!(!options.query || !options.mapping)) {
              _context2.next = 15;
              break;
            }

            options.mapping = options.mapping || DEFAULTMAPPING;
            _context2.next = 18;
            break;

          case 15:
            _context2.next = 17;
            return runQuery(graphql, options);

          case 17:
            queryRecords = _context2.sent;

          case 18:
            // Instanciate the Ghost Sitemaps Manager
            manager = new _SiteMapManager.default(options);
            _context2.next = 21;
            return serialize(queryRecords, defaultQueryRecords, options).forEach(function (source) {
              var _loop3 = function _loop3(type) {
                source[type].forEach(function (node) {
                  // "feed" the sitemaps manager with our serialized records
                  manager.addUrls(type, node);
                });
              };

              for (var type in source) {
                _loop3(type);
              }
            });

          case 21:
            // The siteUrl is only available after we have the returned query results
            options.siteUrl = siteURL;
            options.pathPrefix = '';
            _context2.next = 25;
            return copyStylesheet(options);

          case 25:
            resourcesSiteMapsArray = []; // Because it's possible to map duplicate names and/or sources to different
            // sources, we need to serialize it in a way that we know which source names
            // we need and which types they are assigned to, independently from where they
            // come from

            options.sources = serializeSources(options);
            options.sources.forEach(function (type) {
              if (!type.url) {
                // for each passed name we want to receive the related source type
                resourcesSiteMapsArray.push({
                  type: type.name,
                  xml: manager.getSiteMapXml(type.sitemap, options)
                });
              }
            });
            indexSiteMap = manager.getIndexXml(options); // Save the generated xml files in the public folder

            _context2.prev = 29;
            _context2.next = 32;
            return utils.outputFile(indexSitemapFile, indexSiteMap);

          case 32:
            _context2.next = 37;
            break;

          case 34:
            _context2.prev = 34;
            _context2.t0 = _context2["catch"](29);
            console.error(_context2.t0);

          case 37:
            _i = 0, _resourcesSiteMapsArr = resourcesSiteMapsArray;

          case 38:
            if (!(_i < _resourcesSiteMapsArr.length)) {
              _context2.next = 52;
              break;
            }

            sitemap = _resourcesSiteMapsArr[_i];
            filePath = resourcesSitemapFile.replace(/:resource/, sitemap.type); // Save the generated xml files in the public folder

            _context2.prev = 41;
            _context2.next = 44;
            return utils.outputFile(filePath, sitemap.xml);

          case 44:
            _context2.next = 49;
            break;

          case 46:
            _context2.prev = 46;
            _context2.t1 = _context2["catch"](41);
            console.error(_context2.t1);

          case 49:
            _i++;
            _context2.next = 38;
            break;

          case 52:
            return _context2.abrupt("return");

          case 53:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[29, 34], [41, 46]]);
  }));

  return function (_x2, _x3) {
    return _ref13.apply(this, arguments);
  };
}();