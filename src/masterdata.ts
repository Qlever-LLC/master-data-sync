import lunr from "lunr";
import debug from "debug";
import { config } from './config.js';
const SERVICE: string = config.get('service.name');
const info = debug(`${SERVICE}:info`);
const error = debug(`${SERVICE}:error`);
const trace = debug(`${SERVICE}:trace`);
// Import this first to setup the environment

let data: Array<any> = [];
let aLFA: Array<any> = [];
let aPOHIS: Array<any> = [];
let aKNA: Array<any> = [];
let aSOHIS: Array<any> = [];

let index: any = null;

export type LFA = {
  "Vendor": string,
  "VendorName": string,
  "StreetAddress": string,
  "City": string,
  "POBox": string,
  "POBoxPostalCode": string,
  "PostalCode": string,
  "Region": string,
  "Country": string,
  "TaxNumber1": string,
  "TaxNumber2": string,
  "Telephone1": string,
  "Telephone2": string,
  "CentralDeletionFlag": string,
  "AccountGroup": string
};

export type POHIS = {
  "purchasing_document": string,
  "item": string,
  "plant": string,
  "plant_name": string,
  "vendor": string,
  "vendor_name": string,
  "supplying_vendor_name": string,
  "material": string,
  "material_description": string,
  "material_group": string,
  "material_group_desc": string,
  "document_date": string,
  "purchasing_doc_type": string,
  "deletion_indicator": string,
  "material_type": string,
  "vendor_material_number": string,
  "material_status_desc": string
};

export type KNA = {
  "customer": string,
  "customer_name": string,
  "street_address": string,
  "city": string,
  "POBox": string,
  "POBox_Postal_Code": string,
  "postal_code": string,
  "region": string,
  "country": string,
  "tax_number_1": string,
  "tax_number_2": string,
  "telephone1": string,
  "telephone2": string,
  "central_deletion_flag": string,
  "account_group": string
};

export type SOHIS = {
  "sales_document": string,
  "created_on": string,
  "sales_document_type": string,
  "sales_organization": string,
  "distribution_channel": string,
  "sold_to_party": string,
  "sales_document_item": string,
  "material": string,
  "material_description": string,
  "material_group": string,
  "material_group_description": string,
  "plant": string,
  "plant_name": string,
  "sales_rep_code": string,
  "sales_rep_name": string,
  "material_status_desc": string
};

export default class MasterData {

  pathPrefix: string = "";
  authorization: string = "";
  /**
     * constructor for the class
     */
  //constructor(records: Array<any>) {
  constructor() {

    // populating the index from records
    // for (let record in records) {
    //   let _record = {
    //     "purchasing_document": records[record][0],
    //     "plant": records[record][2],
    //     "name1": records[record][3],
    //     "vendor": records[record][4],
    //     "name2": records[record][5],
    //     "address": records[record][6],
    //     "street": records[record][7],
    //     "city": records[record][8],
    //     "region": records[record][12],
    //     "material": records[record][30],
    //     "material_group": records[record][32],
    //     "material_description": records[record][33],
    //   };

    //   // creating a copy of the record in JSON format
    //   data.push(_record);

    //   index = lunr(function () {
    //     this.ref('name1');
    //     this.field('name1');
    //     this.field('name2');
    //     this.field('vendor');
    //     this.field('address');
    //     this.field('city');
    //     this.field('material');

    //     data.forEach((item: any) => {
    //       this.add(item)
    //     }, this);
    //   });
    //}//for
  }//constructor

  public async buildLFAIndex(records: Array<any>): Promise<Array<any>> {
    // populating the index from records
    for (let record in records) {
      let _record: LFA = {
        "Vendor": records[record][0],
        "VendorName": records[record][1],
        "StreetAddress": records[record][2],
        "City": records[record][3],
        "POBox": records[record][4],
        "POBoxPostalCode": records[record][5],
        "PostalCode": records[record][6],
        "Region": records[record][7],
        "Country": records[record][8],
        "TaxNumber1": records[record][9],
        "TaxNumber2": records[record][10],
        "Telephone1": records[record][11],
        "Telephone2": records[record][12],
        "CentralDeletionFlag": records[record][13],
        "AccountGroup": records[record][14]
      };

      // creating a copy of the record in JSON format
      aLFA.push(_record);

      //console.log(data);

      // index = lunr(function () {
      //   this.ref('name1');
      //   this.field('name1');
      //   this.field('name2');
      //   this.field('vendor');
      //   this.field('address');
      //   this.field('city');
      //   this.field('material');

      //   data.forEach((item: any) => {
      //     this.add(item)
      //   }, this);
      // });
    }//for
    info(`--> LFA Total records: [${aLFA.length}]`);
    return aLFA;
  }//buildLFAIndex

  public async buildPOHISIndex(records: Array<any>): Promise<Array<any>> {
    // populating the index from records
    for (let record in records) {
      let _record: POHIS = {
        "purchasing_document": records[record][0],
        "item": records[record][1],
        "plant": records[record][2],
        "plant_name": records[record][3],
        "vendor": records[record][4],
        "vendor_name": records[record][5],
        "supplying_vendor_name": records[record][6],
        "material": records[record][7],
        "material_description": records[record][8],
        "material_group": records[record][9],
        "material_group_desc": records[record][10],
        "document_date": records[record][11],
        "purchasing_doc_type": records[record][12],
        "deletion_indicator": records[record][13],
        "material_type": records[record][14],
        "vendor_material_number": records[record][15],
        "material_status_desc": records[record][16]
      };

      // creating a copy of the record in JSON format
      aPOHIS.push(_record);

    }//for
    info(`--> POHIS Total records: [${aPOHIS.length}]`);
    return aPOHIS;
  }//POHIS

  public async buildKNAIndex(records: Array<any>): Promise<Array<any>> {
    // populating the index from records
    for (let record in records) {
      let _record: KNA = {
        "customer": records[record][0],
        "customer_name": records[record][1],
        "street_address": records[record][2],
        "city": records[record][3],
        "POBox": records[record][4],
        "POBox_Postal_Code": records[record][5],
        "postal_code": records[record][6],
        "region": records[record][7],
        "country": records[record][8],
        "tax_number_1": records[record][9],
        "tax_number_2": records[record][10],
        "telephone1": records[record][11],
        "telephone2": records[record][12],
        "central_deletion_flag": records[record][13],
        "account_group": records[record][14]
      };

      // creating a copy of the record in JSON format
      aKNA.push(_record);
    }//for
    info(`--> KNA Total records: [${aKNA.length}]`);
    return aKNA;
  }//KNA

  public async buildSOHISIndex(records: Array<any>): Promise<Array<any>> {
    // populating the index from records
    for (let record in records) {
      let _record: SOHIS = {
        "sales_document": records[record][0],
        "created_on": records[record][1],
        "sales_document_type": records[record][2],
        "sales_organization": records[record][3],
        "distribution_channel": records[record][4],
        "sold_to_party": records[record][5],
        "sales_document_item": records[record][6],
        "material": records[record][7],
        "material_description": records[record][8],
        "material_group": records[record][9],
        "material_group_description": records[record][10],
        "plant": records[record][11],
        "plant_name": records[record][12],
        "sales_rep_code": records[record][13],
        "sales_rep_name": records[record][14],
        "material_status_desc": records[record][15]
      };

      // creating a copy of the record in JSON format
      aSOHIS.push(_record);
    }//for
    info(`--> SOHIS Total records: [${aSOHIS.length}]`);
    return aSOHIS;
  }//KNA

  public basic_test() {
    info(index.search("SFD"));
  }//basic_test

  public search(criteria: string) {
    return index.search(criteria);
  }

  public getJSONData() {
    return data;
  }

}