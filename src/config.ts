/**
 * @license
 * Copyright 2022 Qlever LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'dotenv/config';
import convict from 'convict';

export const config = convict({
  oada: {
    domain: {
      doc: 'OADA API domain',
      format: String,
      default: 'localhost',
      env: 'DOMAIN',
      arg: 'domain',
    },
    token: {
      doc: 'OADA API token',
      format: Array,
      default: ['god'],
      env: 'TOKEN',
      arg: 'token',
    },
  },
  /**
   * Add more config stuff when needed
   */
  service: {
    "name": {
      doc: 'service name',
      format: String,
      default: 'master-data-sync',
      env: 'SERVICE_NAME',
      arg: 'SERVICE_NAME',
    },
    "path": {
      doc: 'service path',
      format: String,
      default: '/bookmarks/services/master-data-sync/',
      env: 'SERVICE_PATH',
      arg: 'SERVICE_PATH',
    },
    "startup-mode": {
      doc: 'startup mode',
      format: String,
      default: 'importer',
      env: 'STARTUP',
      arg: 'startup',
    }
  },
  trellis: {
    // "domain": {
    //   doc: 'OADA API domain',
    //   format: String,
    //   default: 'dev.smithfield.trellis.one',
    //   env: 'DOMAIN',
    //   arg: 'domain',
    // },
    // token: {
    //   doc: 'OADA API token',
    //   format: String,
    //   default: 'god-proxy',
    //   env: 'TOKEN',
    //   arg: 'token',
    // },
    endpoints: {
      tps: {
        doc: 'trading partner endpoint in trellis',
        default: "/bookmarks/trellisfw/trading-partners",
      },
      utps: {
        default: "/bookmarks/trellisfw/trading-partners/unidentified-trading-partners-index",
        doc: 'unidentified trading partner endpoint in trellis',
      },
      'fl-bus': {
        default: "/bookmarks/services/fl-sync/businesses",
        doc: 'business mirror endpoint in trellis',
      },
      "tpmidi": {
        doc: 'masterid-index endpoint in trading partners in trellis',
        default: "/bookmarks/trellisfw/trading-partners/masterid-index"
      },
      "service-tp": {
        doc: 'service trading partners endpoint',
        default: "/bookmarks/trellisfw/trading-partners"
      },
      "service-pr": {
        doc: 'service products endpoint',
        default: "/bookmarks/services/master-data-sync/other/products"
      },
      "service-lo": {
        doc: 'service locations endpoint',
        default: "/bookmarks/services/master-data-sync/other/locations"
      },
      "service-datasources-tp": {
        doc: 'service datasource trading partners endpoint',
        default: "/bookmarks/services/master-data-sync/datasources/vendors"
      },
      "service-datasources-pr": {
        doc: 'service datasource products endpoint',
        default: "/bookmarks/services/master-data-sync/datasources/products"
      },
      "service-datasources-lo": {
        doc: 'service datasource locations endpoint',
        default: "/bookmarks/services/master-data-sync/datasources/locations"
      },
      "master-data-mirror": {
        doc: "master data mirror",
        default: "/bookmarks/services/master-data-sync/mirror"
      },
      "master-data-sources": {
        doc: "",
        default: "/bookmarks/services/master-data-sync/data-sources"
      }
    },
    requiredendpoints: {
      doc: 'required endpoints',
      format: Array,
      default: [
        "/bookmarks/services/master-data-sync/mirror/vendors",
        "/bookmarks/services/master-data-sync/mirror/customers",
        "/bookmarks/services/master-data-sync/mirror/sohis",
        "/bookmarks/services/master-data-sync/mirror/pohis",
        "/bookmarks/services/master-data-sync/data-sources/vendors",
        "/bookmarks/services/master-data-sync/data-sources/products",
        "/bookmarks/services/master-data-sync/data-sources/locations",
        "/bookmarks/services/master-data-sync/data-sources/customers",
        "/bookmarks/services/master-data-sync/data-sources/pohis",
        "/bookmarks/services/master-data-sync/data-sources/sohis"
      ]
    },
    datasets: {
      lfa: {
        doc: 'master-data LFA input dataset',
        default: "./data/ZMM_CDS_LFA1_FL.csv",
      },
      pohis: {
        doc: 'master-data POHIS input dataset',
        default: "./data/ZMM_CDS_POHIS_FL.csv",
      },
      kna: {
        doc: 'master-data KNA input dataset',
        default: "./data/ZSD_CDS_KNA1_LF.csv",
      },
      sohis: {
        doc: 'master-data SOHIS input dataset',
        default: "./data/ZSD_CDS_SOHIS_LF.csv",
      }
    },
    concurrency: {
      doc: 'OADA client concurrency',
      format: Number,
      default: 1,
      env: 'CONCURRENCY',
      arg: 'concurrency'
    }
  },
  timeouts: {
    vendor: {
      doc: 'Timeout duration for vendor jobs',
      format: Number,
      default: (3600000 as unknown) as number,
      env: 'VENDOR_TIMEOUT',
      arg: 'vendor-timeout',
    },
    product: {
      doc: 'Timeout duration for product jobs',
      format: Number,
      default: (3600000 as unknown) as number,
      env: 'PRODUCT_TIMEOUT',
      arg: 'product-timeout',
    },
    location: {
      doc: 'Timeout duration for product jobs',
      format: Number,
      default: (3600000 as unknown) as number,
      env: 'LOCATION_TIMEOUT',
      arg: 'location-timeout',
    }
  },
  slack: {
    posturl: {
      format: String,
      // use a real slack webhook URL
      default: 'https://localhost',
      env: 'SLACK_WEBHOOK',
      arg: 'slack-webhook',
    },
  }
});

/**
 * Error if our options are invalid.
 * Warn if extra options found.
 */
config.validate({ allowed: 'warn' });
