/**
 * @license
 * Copyright 2023 Qlever LLC
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

import debug from "debug";
import bPromise from "bluebird";
import MasterData from "./masterdata.js";
import { parse } from "csv-parse";
import fs from "fs";

let records: Array<any> = [];
let masterData: MasterData;
let jsonMasterDataset: Array<any>;

// jobs
//import { Service } from "@oada/jobs";
// ================ debug ================
//let config:any = require('./config').default;
import { config } from './config.js';
const SERVICE: string = config.get('service.name');
const info = debug(`${SERVICE}:info`);
const error = debug(`${SERVICE}:error`);
const trace = debug(`${SERVICE}:trace`);
// Import this first to setup the environment

//const SERVICE_PATH = `/bookmarks/services/${SERVICE}`;

import { OADAClient, connect } from '@oada/client';
import tree from './tree.js';

// Stuff from config
const { token: tokens, domain } = config.get('oada');

// ================ Trellis configuration ================
const STARTUP_MODE: string = config.get("service.startup-mode");
// const TL_DOMAIN: string = config.get('trellis.domain');
// const TL_TOKEN: string = config.get('trellis.token');
const REQUIRED_ENDPOINTS = config.get("trellis.requiredendpoints");
const TL_TP: string = config.get('trellis.endpoints.service-tp');
const TL_TP_MI: string = `${TL_TP}/masterid-index`;

// ============== uploading Master Dataset

async function uploadMasterDataset() {
  fs.createReadStream("./sf-cds-view-2.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row: any) {
      records.push(row);
      //console.log(row);
    })
    .on('end', function () {
      masterData = new MasterData(records);
      // masterData.basic_test();
      info(masterData.search("SFD"));
      info(masterData.search("L0040141"));
      jsonMasterDataset = masterData.getJSONData();
      //resolve(file);
    });
}//uploadMasterDataset

async function uploadPOHISDataset() {
  fs.createReadStream("./data/pohis.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row: any) {
      records.push(row);
      //console.log(row);
    })
    .on('end', function () {
      masterData = new MasterData(records);
      // masterData.basic_test();
      info(masterData.search("SFD"));
      info(masterData.search("L0040141"));
      jsonMasterDataset = masterData.getJSONData();
      //resolve(file);
    });
}//uploadMasterDataset

/**
 * Shared OADA client instance
 */
let CONNECTION: OADAClient;

/**
 * Ensures required trees exist on startup
 */
async function ensureRequiredEndpoints(): Promise<void> {
  try {
    info(`--> Ensuring paths exist.`);
    await bPromise.map(REQUIRED_ENDPOINTS, async function (path: string) {
      await CONNECTION.head({
        path: path,
      }).catch(async (err: any) => {
        if (err.status !== 404) throw err;
        await CONNECTION.put({
          path: path,
          data: {},
          tree
        });
        info(`--> Created ${path}`);
      });
    });//mapper
  } catch (e) { //try
    error(`--> ensureRequiredEndpoints failed.`);
    error(e);
  }//try
}//ensureRequiredEndpoints

/**
 * retrieve Masterid Index
 */
async function retrieveMasterIdIndex() {
  info(`--> retrieving MasterId Index [${TL_TP_MI}].`);

  let response = await CONNECTION.get({
    path: TL_TP_MI
  });

  info(`--> masterid index response`);
  return response.data;
}//retrieveMasterIdIndex

/**
 * Start-up for a given user (token)
 */
async function run(token: string): Promise<void> {
  // Connect to the OADA API
  const conn = CONNECTION
    ? CONNECTION.clone(token)
    : (CONNECTION = await connect({ token, domain: `https://${domain}` }));

  await conn.head({ path: '/bookmarks' });
  // const service = new Service(_arguments);
  // const _service = service.start();
  // Promise.all([_service]).catch((err: any) => {
  //   error(err);
  //   process.exit(1);
  // });
  info("<<<<<<<<<< connected to backend >>>>>>>>>>");
  info(`--> Startup Mode [${STARTUP_MODE}]`);
  switch (STARTUP_MODE) {
    case "init":
      trace("----> Init Mode started.");
      //await ensureRequiredEndpoints();
      info(`--> masterids`);

      info(`--> indexing masterids`);
      await uploadMasterDataset();
      let masterids = await retrieveMasterIdIndex();
      //await deleteMasterIdIndexDelete(masterids);
      //await buildMasterIdIndexDelete(masterids);
      break;
    case "importer":
      trace("----> Importer Mode started.");
      break;
    case "full":
      trace("----> Full Mode started.");
      break;
    default:
      trace("----> Mode not recognized.");
  }//switch
}//run

await Promise.all(tokens.map(async (token: string) => run(token)));

