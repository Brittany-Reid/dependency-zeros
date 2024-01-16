const axios = require('axios');
const fs = require("fs");

const API_KEY = fs.readFileSync("LIBRARIES_API_KEY.txt", {encoding:'utf-8'})

const KEY_PART = "api_key=" + API_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var most_depended_path = "data/most_depended_upon500.json"
var most_depended = fs.existsSync(most_depended_path) ? JSON.parse(fs.readFileSync(most_depended_path, {encoding:'utf-8'})) : [];

var dependency_chain_path = "data/dependency_chain.json";

var dependency_chain = [];
var package_cache = {};
var chain_cache = {};
var parents = [];

// create interface
const lio = axios.create({
  baseURL: 'https://libraries.io/api/',
  headers: {'X-Custom-Header': 'foobar'}
});

const NPM = axios.create({
  baseURL: 'https://registry.npmjs.org/',
  headers: {'X-Custom-Header': 'foobar'}
});


/**
 * Wrapper to handle failed requests.
 * @param {string} requestu 
 * @returns 
 */
async function request(requestu){
  try{
    var response = await lio.get(requestu);
    return response
  }
  catch(e){
    //wait 30 seconds
    console.log(e)
    if(e['response']['status'] == 502){
      await delay(30000)
      var response = await request(requestu);
      return response;
    }
    else{
      console.log(e)
    }
  }
}

async function requestNPM(requestu){
  try{
    var response = await NPM.get(requestu);
    return response
  }
  catch(e){
    //wait 30 seconds
    if(e['response']['status'] == 502){
      await delay(30000)
      var response = await requestNPM(requestu);
      return response;
    }
    else{
      console.log(e)
    }
  }
}

/**
 * Format package names for URLs
 * @param {string} name Package name
 */
function formatName(name){
  return name.replace("/", "%2F");
}

/**Get most depended upon libraries and write to file.*/
async function getMostDependedUpon(limit){
  var num = 1
  var pages = Math.ceil(limit/100);
  for(var i = 0; i<pages; i++){
    console.log(i)
    var response = await request("search?platforms=NPM&sortq=dependents_count&per_page=100&page=" + (i+1) + "&" + KEY_PART)
    var data = response["data"];
    console.log(response)
    most_depended = most_depended.concat(data);
  }
  fs.writeFileSync(most_depended_path, JSON.stringify(most_depended))
  //somehow this got less than 500 so i just manually appended to the end of the file
}


/**
 * Build the dependency chain of most depended upon packages.
 * @param {number} limit 
 */
async function buildDependencyChain(limit){
  var i = 0;
  for(var d of most_depended){
    if(i >= limit) break;
    package_name = d['name'];
    console.log("root: " + package_name)
    var chain = await getDependencyChain(package_name);
    dependency_chain.push(chain)
    i++
  }
  fs.writeFileSync(dependency_chain_path, JSON.stringify(dependency_chain, null, 1))

}

async function getDependencyChain(name){
  if(name in chain_cache) return chain_cache[name];
  //track depth and parents
  parents.push(name);
  var dependencies = await getDependencies(name);
  var chain = [];
  var i = 0;
  for(var d of dependencies){
    // if(i >= 2) break;
    console.log(" ".repeat(parents.length) + d)
    if(parents.includes(d)){
      chain.push(d + '...')
    }
    else{
      chain.push(await getDependencyChain(d));
    }
    i++
  }
  parents.pop()
  var parentChain = {}
  if(!chain || chain.length == 0) return name;
  parentChain[name] = chain;
  chain_cache[name] = chain;
  return parentChain;
}

/**
 * Return a list of dependencies for a given package name.
 */
async function getDependencies(name){
  if(name in package_cache) return package_cache[name];
  await delay(1000);
  var response = await requestNPM(formatName(name))
  var latest = response['data']['dist-tags']['latest'];
  var dependencies = response['data']['versions'][latest]['dependencies']
  if(!dependencies) return [];
  var dependency_list = Object.keys(dependencies)
  // var response = await request("NPM/" + formatName(name) + "/latest/dependencies?" + KEY_PART);
  // var dependencies = response["data"]["dependencies"];
  // var dependency_list = [];
  // for(var d of dependencies){
  //   dependency_name = d['name'];
  //   dependency_list.push(dependency_name);
  // }
  package_cache[name] = dependency_list;
  return dependency_list;
}

/**Get the full version history for a subset of our dataset */
async function zerosHistory(){
  var zeroRegistry = 'data/registry_entries.json';
  var zeroRegistryData = [];
  var zeros = JSON.parse(fs.readFileSync('data/zero500.json'));
  for(var p of zeros){
    var response = await requestNPM(formatName(p))
    var data = response['data'];
    zeroRegistryData.push(data)
  }
  fs.writeFileSync(zeroRegistry, JSON.stringify(zeroRegistryData))
}

// getMostDependedUpon(500)

buildDependencyChain(10)

// zerosHistory()