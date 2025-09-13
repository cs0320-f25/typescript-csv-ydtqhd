import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import * as z from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");

test("parseCSV yields arrays", async () => {
    const results = await parseCSV(PEOPLE_CSV_PATH)

    expect(results).toHaveLength(5);
    expect(results[0]).toEqual(["name", "age"]);
    expect(results[1]).toEqual(["Alice", "23"]);
    expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
    expect(results[3]).toEqual(["Charlie", "25"]);
    expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
    const results = await parseCSV(PEOPLE_CSV_PATH)
    for (const row of results) {
        expect(Array.isArray(row)).toBe(true);
    }
});

test("parseCSV yields comma-containing fields", async () => {
    const expected = [
        ["quote", "speaker", "location", "date"],
        ["I have a dream.,Martin Luther King Jr.", "Washington, D.C.", "1963-08-28"],
        ["That's one small step for man, one giant leap for mankind.", "Neil Armstrong", "Moon (Apollo 11)", "1969-07-20"],
        ["Mr. Gorbachev, tear down this wall!", "Ronald Reagan", "Berlin", "1987-06-12"]
    ];
    const results = await parseCSV(path.join(__dirname, "../data/quotes w commas.csv"));
    expect(results).toEqual(expected);
});

test("parseCSV yields empty fields", async () => {
    const expected = [
        ["quote", "speaker", "location", "date"],
        ["The pen is mightier than the sword.", "Edward Bulwer-Lytton", "", ""],
        ["You can't judge a book by its cover", "", "", ""]
    ];
    const results = await parseCSV(path.join(__dirname, "../data/quotes w unknown.csv"));
    expect(results).toEqual(expected);
});

test("parseCSV yields multiline fields", async () => {
    const expected = [
        ["quote", "speaker", "location", "date"],
        ["I have a dream.,Martin Luther King Jr.", "Washington, D.C.", "1963-08-28"],
        ["That's one small step for man, one giant leap for mankind.", "Neil Armstrong", "Moon (Apollo 11)", "1969-07-20"],
        ["Mr. Gorbachev, tear down this wall!", "Ronald Reagan", "Berlin", "1987-06-12"],
        ["Ask not what your country can do for you—\nask what you can do for your country.", "John F. Kennedy", "Washington, D.C.", "1961-01-20"]
    ];
    const results = await parseCSV(path.join(__dirname, "../data/quotes w multiline.csv"));
    expect(results).toEqual(expected);
});

test("parseCSV escapes double quotes inside comma-containing fields", async () => {
    const expected = [
        ["quote", "speaker", "location", "date"],
        ["I have a dream.", "Martin Luther King Jr.", "Washington, D.C.", "1963-08-28"],
        ["That’s one small step for man, one giant leap for mankind.", "Neil Armstrong", "Moon (Apollo 11)", "1969-07-20"],
        ["Mr. Gorbachev, tear down this wall!", "Ronald Reagan", "Berlin", "1987-06-12"],
        ["The pen is mightier than the sword.", "Edward Bulwer-Lytton", "", ""],
        ["You can't judge a book by its cover", "", "", ""],
        ['"If I have seen further, it is by standing on the shoulders of giants."', "Isaac Newton", "", ""]
    ];
    const results = await parseCSV(path.join(__dirname, "../data/quotes w double quotes.csv"));
    expect(results).toEqual(expected);
});

test("parseCSV parses using given zod schema", async () => {
    const Quote = z.tuple([z.string(), z.string(), z.string(), z.iso.date()])
        .transform(tup => ({
            quote: tup[0],
            speaker: tup[1],
            location: tup[2],
            date: tup[3]
        }));

    const expected = [
        Quote.parse(["The only thing we have to fear is fear itself","Franklin D Roosevelt","Washington","1933-03-04"]),
        Quote.parse(["Knowledge is power","Francis Bacon","London","1597-01-01"])
    ];
    
    const results = await parseCSV(path.join(__dirname, "../data/quotes.csv"), Quote, true);
    expect(results).toEqual(expected);
});
