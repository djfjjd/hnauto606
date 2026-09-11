import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {STATUS} from '../src/data.js';

const PNG_SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);

function crc32(buffer){
  let crc=0xffffffff;
  for(const byte of buffer){
    crc^=byte;
    for(let bit=0;bit<8;bit+=1)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return(crc^0xffffffff)>>>0;
}

function pngChunk(type,data){
  const name=Buffer.from(type),length=Buffer.alloc(4),checksum=Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([name,data])));
  return Buffer.concat([length,name,data,checksum]);
}

function transparentPalettePng(source){
  if(!source.subarray(0,8).equals(PNG_SIGNATURE))throw new Error('PNG 파일이 아닙니다.');
  const chunks=[];
  for(let offset=8;offset<source.length;){
    const length=source.readUInt32BE(offset),type=source.toString('ascii',offset+4,offset+8),end=offset+12+length;
    chunks.push({type,data:Buffer.from(source.subarray(offset+8,offset+8+length))});
    offset=end;
  }
  const header=chunks.find(chunk=>chunk.type==='IHDR');
  if(!header||header.data[9]!==3)throw new Error('팔레트 PNG만 처리할 수 있습니다.');
  const palette=chunks.find(chunk=>chunk.type==='PLTE');
  if(!palette)throw new Error('PNG 팔레트가 없습니다.');
  const alpha=Buffer.alloc(palette.data.length/3,255);
  for(let index=0;index<alpha.length;index+=1){
    const start=index*3,r=palette.data[start],g=palette.data[start+1],b=palette.data[start+2],opacity=255-Math.min(r,g,b);
    alpha[index]=opacity<4?0:opacity;
    if(opacity>=4&&opacity<255){
      palette.data[start]=Math.max(0,Math.min(255,Math.round((r-255+opacity)*255/opacity)));
      palette.data[start+1]=Math.max(0,Math.min(255,Math.round((g-255+opacity)*255/opacity)));
      palette.data[start+2]=Math.max(0,Math.min(255,Math.round((b-255+opacity)*255/opacity)));
    }
  }
  const output=[PNG_SIGNATURE];
  for(const chunk of chunks){
    if(chunk.type==='tRNS')continue;
    output.push(pngChunk(chunk.type,chunk.data));
    if(chunk.type==='PLTE')output.push(pngChunk('tRNS',alpha));
  }
  return Buffer.concat(output);
}

const files=new Set(STATUS.flatMap(status=>[status.icon.normalize('NFC'),status.icon.normalize('NFD')]));
for(const filename of files){
  const path=resolve('public',filename),source=readFileSync(path);
  writeFileSync(path,transparentPalettePng(source));
  console.log(`투명 배경 적용: ${filename}`);
}
