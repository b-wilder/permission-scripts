/*
 *   BEFORE RUNNING THIS SCRIPT:
 *       1. npm install fs --global
 *       2. npm install pixl-xml --global
 */
const fs = require('fs');
const XML = require('pixl-xml');
//
let myArgs = process.argv.slice(2);
let grantEditAccess = myArgs[0];
let sObjectApiName = myArgs[1];
const flsXml = `    <fieldPermissions>
        <editable>{0}</editable>
        <field>{1}</field>
        <readable>true</readable>
    </fieldPermissions>`;
let combinedFlsXml = '';
const readOnlyTypes = new Set(['AutoNumber', 'ExternalLookup', 'IndirectLookup', 'Summary', 'File']);
const formulaElement = 'formula';
//
let dirPath = `./force-app/main/default/objects/${sObjectApiName}/fields`;
const dir = fs.opendirSync(dirPath);
let dirent;
while ((dirent = dir.readSync()) !== null) {
    let filePath = `${dirPath}/${dirent.name}`;
    let contents = fs.readFileSync(filePath).toString();
    let jsonContents = XML.parse(contents);
    let editable = false;
    if (jsonContents.required === 'true') {
        continue; //You cannot set FLS for a required field
    }
    else if (
        (!readOnlyTypes.has(jsonContents.type)) && (!jsonContents.hasOwnProperty(formulaElement)) && grantEditAccess === 'true') {
        editable = true;
    }
    else {
        editable = false;
    }
    let fieldFlsXml = flsXml.replace('{0}', editable).replace('{1}', `${sObjectApiName}.${jsonContents.fullName}`);
    console.log(fieldFlsXml);
}
dir.closeSync();