import { exec } from "./exec";
import { tokenize } from "./parse/tokenize";

const test = "DataSet\n| where IntField == 1\n| project IntField, StringField";
const testQuery = tokenize(test);
const testResult = exec(testQuery);

console.log(testResult);
