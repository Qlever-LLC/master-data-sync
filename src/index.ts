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
import moment from "moment";

// master data arrays
let masterData: MasterData = new MasterData();
let aLFA: Array<any> = [];
let aPOHIS: Array<any> = [];
let aKNA: Array<any> = [];
let aSOHIS: Array<any> = [];
let TODAY = moment().format("YYYY-MM-DD");

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
const LFA = config.get('trellis.datasets.lfa');
const POHIS = config.get('trellis.datasets.pohis');
const KNA = config.get('trellis.datasets.kna');
const SOHIS = config.get('trellis.datasets.sohis');
const MD_DATASOURCES = config.get('trellis.endpoints.master-data-sources');
const MD_MIRROR = config.get('trellis.endpoints.master-data-mirror');
const VENDORS_MIRROR = `${MD_MIRROR}/vendors`;
const CUSTOMERS_MIRROR = `${MD_MIRROR}/customers`;
const SOHIS_MIRROR = `${MD_MIRROR}/sohis`;
const POHIS_MIRROR = `${MD_MIRROR}/pohis`;

// The following constants need to be added to the config
const VENDORS_PATH = `${MD_DATASOURCES}/vendors`;

const timeout = (ms: number) => new Promise(res => setTimeout(res, ms));
const MS: number = 4000;

// ============== uploading Master Dataset =========================
async function uploadMasterDataLFA(): Promise<Array<any>> {
  let _records: Array<any> = [];
  await fs.createReadStream(LFA)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row: any) {
      _records.push(row);
    })
    .on('end', async function () {
      aLFA = await masterData.buildLFAIndex(_records);
    });
  return aLFA;
}//uploadMasterDataset

/**
 * Uploads POHIS master dataset
 */
async function uploadPOHISDataset() {
  let _records: Array<any> = [];
  fs.createReadStream(POHIS)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row: any) {
      _records.push(row);
    })
    .on('end', async function () {
      aPOHIS = await masterData.buildPOHISIndex(_records);
    });
}//uploadMasterDatasetPOHIS

/**
 * Imports the KNA dataset
 */
async function uploadKNADataset() {
  let _records: Array<any> = [];
  fs.createReadStream(KNA)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row: any) {
      _records.push(row);
    })
    .on('end', async function () {
      aKNA = await masterData.buildKNAIndex(_records);
    });
}//uploadMasterDatasetKNA

/**
 * Imports the SOHIS dataset
 */
async function uploadSOHISDataset() {
  let _records: Array<any> = [];
  fs.createReadStream(SOHIS)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row: any) {
      _records.push(row);
    })
    .on('end', async function () {
      aSOHIS = await masterData.buildSOHISIndex(_records);
    });
}//uploadMasterDatasetSOHIS

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

/** Iterates in all memory Vendors and
 * sends a request to create the Vendors in the
 * master-data mirror
 */
async function populateVendors() {
  let _counter: number = 0;
  console.time('vendor-creation');
  aLFA.forEach(async function (vendor) {
    info(`--> creating a Vendor [${_counter}]`);
    _counter++;
    await createVendor(vendor);
  });
  console.timeEnd('vendor-creation');
}//populateVendors

/**
 * Configuration for the Vendors Import
 * This adds information necessary for the fail-over
 */
async function setImportConfigVendors() {
  let _path: string = VENDORS_PATH + '/logs/' + TODAY;
  trace(_path);
  let _data = {
    TotalRecords: 25165,
    LastRecordCreated: 1000
  };

  await CONNECTION.put({
    path: _path,
    data: _data,
    tree
  });
  info(`--> Created ${_path}`);

}//setConfigVendors

/**
 * Creates a Vendor in the master-data mirror
 * @param vendor
 */
async function createVendor(vendor: any) {
  let _path: string = `${VENDORS_MIRROR}/${vendor.Vendor}`;
  trace(`----> creating ${_path}`)

  await CONNECTION.put({
    path: _path,
    data: vendor,
    tree
  });
  info(`--> Created ${_path}`);
}//createVendor

/**
 * retrieve MasterId Index
 */
async function retrieveMasterIdIndex() {
  info(`--> retrieving MasterId Index [${TL_TP_MI}].`);

  let response = await CONNECTION.get({
    path: TL_TP_MI
  });

  info(`--> masterId index response`);
  return response.data;
}//retrieveMasterIdIndex

/**
 * retrieve Today's Vendors
 */
async function retrieveVendorsDataset() {
  let _path: string = VENDORS_PATH + '/day-index/' + TODAY;
  info(`--> retrieving Vendors Dataset [${_path}].`);

  let response = await CONNECTION.get({
    path: _path
  });

  info(`--> Vendors Today's dataset `);
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
    case "importer":
      trace("----> Importer Mode started.");
      trace(`----> ${TODAY}`);
      trace("----> importing LFA csv dataset ...");
      await uploadMasterDataLFA();
      trace("----> importing POHIS csv dataset ...");
      await uploadPOHISDataset();
      trace("----> importing KNA csv dataset ...");
      await uploadKNADataset();
      trace("----> importing SOHIS csv dataset ...");
      await uploadSOHISDataset();
      trace("----> ensuring required endpoints ...");
      await ensureRequiredEndpoints();

      await timeout(MS);

      await populateVendors();
      await setImportConfigVendors();
      info(aLFA.length);
      info(aPOHIS.length);
      info(aKNA.length);
      info(aSOHIS.length);
      break;

    case "init":
      trace("----> Init Mode started.");
      //await ensureRequiredEndpoints();
      info(`--> masterids`);
      info(`--> indexing masterids`);
      //await uploadMasterDataset();
      //let masterids = await retrieveMasterIdIndex();
      //await deleteMasterIdIndexDelete(masterids);
      //await buildMasterIdIndexDelete(masterids);
      break;
    case "full":
      trace("----> Full Mode started.");
      break;
    default:
      trace("----> Mode not recognized.");
  }//switch
}//run

await Promise.all(tokens.map(async (token: string) => run(token)));

