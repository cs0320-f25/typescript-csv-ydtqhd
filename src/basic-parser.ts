import { error } from "console";
import * as fs from "fs";
import * as readline from "readline";
import * as z from "zod";

/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * File I/O in TypeScript is "asynchronous", meaning that we can't just
 * read the file and return its contents. You'll learn more about this 
 * in class. For now, just leave the "async" and "await" where they are. 
 * You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @param schema The Zod schema used on parsing data rows.
 * @param hasHeader Omit the first row if provided with `true`.
 * @returns a "promise" to produce a 2-d array of cell values
 * @throws `Error("Invalid CSV: ....")` Errors on files that are malformed.
 */
export async function parseCSV<T>(path: string, schema?: z.ZodType<T>, hasHeader?: boolean): Promise<(string[] | T)[]> {
    // This initial block of code reads from a file in Node.js. The "rl"
    // value can be iterated over in a "for" loop. 
    const fileStream = fs.createReadStream(path);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity, // handle different line endings
    });

    // Create an empty array to hold the results
    let result = []
    let rowLength: number | undefined = undefined;

    // We add the "await" here because file I/O is asynchronous. 
    // We need to force TypeScript to _wait_ for a row before moving on. 
    // More on this in class soon!
    for await (const line of rl) {
        const values = line.split(",").map((v) => v.trim());
        if (hasHeader) {
            hasHeader = false;
            continue;
        }
        // check & update row length
        if (!rowLength) {
            rowLength = values.length;
        } else if (rowLength !== values.length) {
            throw new Error("Invalid CSV: Row length mismatch.");
        }

        if (schema) {
            result.push(schema.parse(values))
        } else {
            result.push(values)
        }
    }
    return result
}
