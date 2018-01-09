
/*
 This file for messing around with form generation for a CMS-type dealio.
 Haven't looked at it too much lately.
*/


var ts = require("typescript");
var fs = require("fs");
var R = require('ramda');

const FOLDER = "types/";

function parseFile(inTypes, fname) {
    const sourceFile = ts.createSourceFile(
        fname,
        fs.readFileSync(fname).toString(),
        ts.ScriptTarget.ES3,
        true
    );

    const statements = sourceFile.statements;
    // const firstStatement = statements[0];
    // // console.log(Object.keys(firstStatement));
    // console.log(parseInterface(statements[3]));
    debugger;
    
    return R.reduce(parseStatement, inTypes, statements);
}

function parseStatement(types, statement) {
    const kind = statement.kind;
    console.log(`Parsing statement kind: ${findKind(kind)} (${kind})`);
    const SK = ts.SyntaxKind;
    switch (kind) {
        case SK.ImportDeclaration:
            return loadImport(types, statement);
        case SK.InterfaceDeclaration:
            return parseInterface(types, statement);
        case SK.TypeAliasDeclaration:
            return parseTypeAlias(types, statement);
    }
    return types;
}

function findKind(num) {
    return R.toPairs(ts.SyntaxKind).find((pair) => {
        var name = pair[0];
        var typeNum = pair[1];
        return num === typeNum;
    })[0];
}

function getTypeName(def) {
    if (def.typeName && def.typeName.text) {
        return def.typeName.text;
    }

    if (def.kind === ts.SyntaxKind.StringKeyword) {
        return 'string';
    }

    if (def.kind === ts.SyntaxKind.BooleanKeyword) {
        return 'boolean';
    }

    throw new Error('Unknown type name: ' + findKind(def.kind));
}

function parseTypeAlias(types, obj) {
    
}

function parseMember(obj) {
    var memberName = obj.name.text;
    var isArray = obj.type.typeName && obj.type.typeName.text === 'Array';
    var typeDef = isArray ? obj.type.typeArguments[0] : obj.type;
    var typeName = getTypeName(typeDef);
    return {
        name: memberName, isArray, typeName,
        optional: obj.questionToken && obj.questionToken.kind === ts.SyntaxKind.QuestionToken
    }

}

function parseInterface(types, obj) {
    var name = obj.name.text;
    if (types[name]) {
        types;
    }

    var members = R.map(parseMember, obj.members);
    var parsed = {
        name, members
    };
    return R.assoc(name, parsed, types);
}

function resolveFileName(importFile) {
    // yeah this is bad and dumb
    const normalized = (importFile.indexOf('./') === 0 ?
        importFile.slice(2, importFile.length) :
        importFile
    );
    return normalized + '.ts';
}

function loadImport(types, dec) {
    const importedTypes = R.map((elem) => {
        return elem.name.text;
    }, dec.importClause.namedBindings.elements);
    const importFile = resolveFileName(dec.moduleSpecifier.text);
    const unknownTypes = R.any((name) => !types[name], importedTypes);
    if (!unknownTypes) {
        return types;
    }

    return parseFile(types, FOLDER + importFile);
}

function start() {
    
    const mainFile = "area.ts";
    const fname = FOLDER + mainFile;

    const types = parseFile({}, fname);
    console.log('done!');
    console.log(types);
}

start();


