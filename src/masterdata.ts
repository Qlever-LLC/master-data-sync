import lunr from "lunr";

let data: Array<any> = [];

let index: any = null;

export default class MasterData {

  pathPrefix: string = "";
  authorization: string = "";
  /**
     * constructor for the class
     */
  constructor(records: Array<any>) {

    // populating the index from records
    for (let record in records) {
      let _record = {
        "purchasing_document": records[record][0],
        "plant": records[record][2],
        "name1": records[record][3],
        "vendor": records[record][4],
        "name2": records[record][5],
        "address": records[record][6],
        "street": records[record][7],
        "city": records[record][8],
        "region": records[record][12],
        "material": records[record][30],
        "material_group": records[record][32],
        "material_description": records[record][33],
      };

      // creating a copy of the record in JSON format
      data.push(_record);

      index = lunr(function () {
        this.ref('name1');
        this.field('name1');
        this.field('name2');
        this.field('vendor');
        this.field('address');
        this.field('city');
        this.field('material');

        data.forEach((item: any) => {
          this.add(item)
        }, this);
      });
    }//for
  }//constructor

  public basic_test() {
    console.log(index.search("SFD"));
  }//basic_test

  public search(criteria: string) {
    return index.search(criteria);
  }

  public getJSONData() {
    return data;
  }

}