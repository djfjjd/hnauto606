export const HEYDEALER_RECORDS_KEY='hana-auto-heydealer-records-v1';

export function readHeydealerRecords(storage=localStorage){
  try{
    const records=JSON.parse(storage.getItem(HEYDEALER_RECORDS_KEY)||'[]');
    return Array.isArray(records)?records:[];
  }catch{return[];}
}

export function saveHeydealerRecord(record,storage=localStorage){
  const records=readHeydealerRecords(storage);
  records.unshift(record);
  storage.setItem(HEYDEALER_RECORDS_KEY,JSON.stringify(records));
  return records;
}
