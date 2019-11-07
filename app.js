'use strict';

const fs = require('fs');

function lengthInUtf8Bytes(str) {
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}

async function mergeJSON(folderPath, ipFileBaseName, opFileBaseName, maxFileSize) {
    return await fs.readdir(folderPath, (err, files) => {
        const noOfFiles = files.length;
        let rawData = fs.readFileSync(folderPath + '/' + ipFileBaseName + 1 + '.json');
        let arrayKey = Object.keys(JSON.parse(rawData))[0];
        let jsonArray = JSON.parse(rawData)[arrayKey];
        if(noOfFiles>2){
            for(var i=2; i<=noOfFiles; i++){
                try{
                    rawData = fs.readFileSync(folderPath + '/' + ipFileBaseName + i + '.json');
                    let jsonData = JSON.parse(rawData)[arrayKey];
                    jsonArray = jsonArray.concat(jsonData);
                }
                catch (e) {
                }
            }
        }

        var finalJSONObject = {};
        var opFileSuffix = 1;
        for (var i=0; i<jsonArray.length; i++){
            for(var j=jsonArray.length-1; j>=i; j--){
                finalJSONObject[arrayKey] = jsonArray.slice(i,j+1);
                if(lengthInUtf8Bytes(JSON.stringify(finalJSONObject)) <= maxFileSize){
                    fs.writeFileSync(folderPath+ '/' +opFileBaseName+ opFileSuffix+ '.json', JSON.stringify(finalJSONObject));
                    opFileSuffix++;
                    i=j;
                    break;
                }
            }
        }
    });
}

var folderPath = '';
var ipFileBaseName = '';
var opFileBaseName = '';
var maxFileSize = 0;

folderPath = process.argv[2];
ipFileBaseName = process.argv[3];
opFileBaseName = process.argv[4];
maxFileSize = process.argv[5];


mergeJSON(folderPath, ipFileBaseName, opFileBaseName, maxFileSize);
