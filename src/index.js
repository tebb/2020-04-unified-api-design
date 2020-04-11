#!/usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");
const yargs = require("yargs");
const YAML = require("yamljs");

const options = yargs
 .usage("Usage: -n <name>")
 .option("n", { alias: "name", describe: "Your name", type: "string", demandOption: true })
 .option("t", { alias: "type", describe: "Format Type ([j]son, [p]roto, [s]dl, [a]syncapi, [o]penapi)", type: "string", demandOption: false})
 .argv;

// convert YAML into JSON
var alps_document = YAML.load(options.name);
var rtn = "";
var format = options.type.toLowerCase();

// handle requested translation
switch (format) {
  case "d":
  case "sdl":
    rtn = toSDL(alps_document);
    break;
  case "a":
  case "asyncapi":
    rtn = toAsync(alps_document);
    break;
  case "o":		
  case "openapi":
    rtn = toOAS(alps_document);
    break;
  case "p":
  case "proto":
    rtn = toProto(alps_document);
    break;
  case "j":
  case "json":
  //default:
    rtn = toJSON(alps_document);
    break;		
}

// output directly
console.log(rtn);

// *******************************************
// translators
// *******************************************

function toJSON(doc) {
  var rtn = ""; 
  rtn = JSON.stringify(doc, null, 2);
  return rtn
}

function toProto(doc) {
  var rtn = "";
  var obj;
  var coll;

  rtn += 'syntax = "proto3";\n';
  rtn += 'package = "'+doc.alps.name+'"\n';
  rtn += '\n';

  coll = doc.alps.descriptor.filter(semantic);
  coll.forEach(function(msg) {
    rtn += 'message '+msg.id+'Params {\n';
    var c = 0;
    c++;
    rtn += '  string '+msg.id+' = '+c+';\n';    
    rtn += '}\n';
  });
  rtn += '\n';

  coll = doc.alps.descriptor.filter(groups);
  coll.forEach(function(msg) {
    rtn += 'message '+msg.id+' {\n';
    var c = 0;
    msg.descriptor.forEach(function(prop) {
      c++;
      rtn += '  string '+prop.id+' = '+c+';\n';    
    });
    rtn += '}\n';
    rtn += 'message '+msg.id+'Response {\n';
    rtn += '  repeated '+msg.id+' '+msg.id+'Collection = 1\n'
    rtn += '}\n';
  });
  rtn += '\n';


  rtn += 'service '+doc.alps.name+'Service {\n';
  
  coll = doc.alps.descriptor.filter(safe);
  coll.forEach(function(item) {
    rtn += '  rpc '+item.id+'('
    if(item.descriptor) {
      rtn += item.descriptor[0].id;      
    }
    rtn += ') returns ('+item.rt+'Collection ) {}\n';  
  });
  
  coll = doc.alps.descriptor.filter(unsafe);
  coll.forEach(function(item) {
    rtn += '  rpc '+item.id+'('
    if(item.descriptor) {
      rtn += item.descriptor[0].id;      
    }
    rtn += ') returns ('+item.rt+'Collection ) {}\n';  
  });

  coll = doc.alps.descriptor.filter(idempotent);
  coll.forEach(function(item) {
    rtn += '  rpc '+item.id+'('
    if(item.descriptor) {
      rtn += item.descriptor[0].id;
      if(item.descriptor[0].id === "id") {
        rtn += "Params";
      }      
    }
    rtn += ') returns ('+item.rt+'Collection ) {}\n';  
  });
  
  rtn += '}\n';
 
  return rtn;
}

function semantic(doc) {
  return doc.type === "semantic";
}

function groups(doc) {
  return doc.type === "group";
}

function safe(doc) {
  return  doc.type === "safe";
}

function unsafe(doc) {
  return  doc.type === "unsafe";
}

function idempotent(doc) {
  return  doc.type === "idempotent";
}

function toSDL(doc) {
  var rtn = "";
  rtn = toJSON(doc);
  return rtn;
}

function toOAS(doc) {
  var rtn = "";
  rtn = toJSON(doc);
  return rtn;
}

function toAsync(doc) {
  var rtn = "";
  rtn = toJSON(doc);
  return rtn;
}

