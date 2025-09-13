# Sprint 1: TypeScript CSV

### Task B: Proposing Enhancement

- #### Step 1: Brainstorm on your own.

    1. The current implementation incorrectly treats commas inside double quotes as delimiters.
    2. The current implementation cannot parse data rows that span multiple lines.
    3. The parser can let users specify and treat the first data row as column headers.
    4. The behavior of when parsing a malformed csv file is undefined.

- #### Step 2: Use an LLM to help expand your perspective.

- #### Step 3: propose enhancements in your project README ﬁle:

    Include a list of the top 4 enhancements or edge cases you think are most valuable to explore in the next week’s sprint. Label them clearly by category (extensibility vs. functionality), and include whether they came from you, the LLM, or both. Describe these using the User Story format—see below for a definition. 

    - \[Extensibility\] As a user of the parser, I can tell if the csv file I provided cannot be parsed. (Source: Me & ChatGPT)

        Acceptance Criteria:
        - The user gets an error when the file is missing or inaccessible.
        - The user gets an error when the file is not a text file or in csv format.
        - The user gets an error when the file has mismatched quotes.
        - The user gets an error when the file has variable row length.
    
    - \[Functionality\] As a user of the parser, I can parse multiline and comma-containing csv files. (Source: Me & ChatGPT)

        Acceptance Criteria:
        - The parser treats commas enclosed by a double quote pair as part of row data.
        - The parser treats three double quotes enclosed by a double quote pair as an escaped double quote.
        - The parser treats new line characters enclosed by a double quote as part of row data.
        - The parser ignores outermost pairs of double quotes in a data row.
    
    - \[Extensibility\] As a user of the parser, I can specify if the provided file has a column headers, so I can seperate the first row from the rest of data. (Source: Me & ChatGPT)

        Acceptance Criteria:
        - The user can use a boolean parameter to specify if the first row should be treated as column header row.
        - When not specified, the first row is considered a normal data row.
        - The column header row is not parsed nor returned.
    
    - \[Extensibility\] As a user of the parser, I can specify the data type a column will be parsed into. (Source: Me & ChatGPT)

        Acceptance Criteria:
        - The parser output data as string by default.
        - The user can provide a schema to parse data in a specific column into a given datatype.
        - The user can provide a schema or constructor to parse every row into an object.

    Include your notes from above: what were your initial ideas, what did the LLM suggest, and how did the results differ by prompt? What resonated with you, and what didn’t? (3-5 sentences.) 

    My ideas were mostly confirmed by ChatGPT. It also suggested extra considerations like file encoding, skipping empty lines, variable row lengths, and newline style differences. It went further by mentioning developer experience, security, and documentation. When I asked it to explain domain-specific terms, the answers were more detailed but otherwise similar. When I specified the project to be simple and manageable for a class assignment, the suggestions became clearer with must-have vs. nice-to-have features and simpler examples, which resonated more. What didn’t resonate were the advanced, production-level concerns that seemed unnecessary for my assignment.

### Design Choices

- I use an optional boolean parameter for skipping the column headers row.
- I use an optional Zod schema parameter for parsing using zod schema.
- Parsing malformed or invalid csv files throws error instead of trying to fix the document.

### 1340 Supplement

To represent JSON-encoded instances of stack with a Zod schema. Assuming the stack object looks like:
```typescript
{
    array: [....]       // stack implemented using (array)
    length: ....        // (nonnegative int)
}
```

Then the Zod schema to would look like:
```typescript
function stackSchema<T extends z.ZodTypeAny>(elemType: T) {
    return z.object({ 
        array: z.array(elemType),
        length: z.int().nonnegative()
    });
}
```

I have not tested this schema using actual code, so I am not sure if `z.int()` supports `.nonnegative()` because it only appears for validating `z.number()` and `z.bigint()`.

- #### 1. Correctness

    A CSV parser is correct if it can parse any file that follows the CSV standard (i.e. RFC 4180). It should seperate data fields by comma, behave as expected on quoted fields (e.g. multiline, escaped double quote, comma inside data), and handle different new line styles. If the provided file is malformed or invalid, the parser should raise an error to inform the caller.

- #### 2. Random, On-Demand Generation

    If I were proviede with this random CSV generator function, I can use it to generate CSV files on the fly during testing instead of manually creating csv files for testing. I would use a for loop to have multiple trials using the generator function to make the testing coverage more robust. If the function allows specifying the content of the csv in some way (e.g. mutiline data rows, comma-containing data rows, and double-quote-containing data rows), I would give specifications to generate tests for different csv rules the parser needs to support.

- #### 3. Overall experience, Bugs encountered and resolved

    It surprised me that `(string[] | T)[]` and `string[][] | T[]` is two different types in TypeScript. I did not encounter any bug when implementing zod schema support. I think I managed to avoid them by thoroughly following instructions provided in the sprint handout doc, slides in class, and documentation from Zod. Apparently, there are failed tests as the current implementation does not handle double quotes as expected. But this is not the concern of this sprint, I did not work on fixing this bug.

#### Errors/Bugs: 

No major bugs. Failing to handle mutiline data rows, comma-containing data rows, and double-quote-containing data rows are omitted.

#### Tests:

- Tests using `quote w [....].csv` are used to test special rules of csv files.
- Files under `malformed` are used to test error handling on malformed csv files. The corresponding jest unit tests are unimplemented for now.
- Test using `quotes.csv` are used to test Zod schema support feature.

#### How To…

- Build and run: `npm install` then `npm run run`

    You can refer to `.nvmrc` for the node version used (If you have `nvm` installed, you can use `nvm use`).

- Test: `npm run test`

#### Team members and contributions (include cs logins):
- Eddie Lin: `hlin82`

#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI):
- ChatGPT (5): Generated textual content for the test CSV files `quotes[....].csv` and `[....] double quote.csv`. Instructions were provided on the required column headers and the symbols to include in the main content fields. Chat history can be found at `./ChatHistory.md`.

#### Total estimated time it took to complete project: approx. 8 hours
#### Link to GitHub Repo: https://github.com/cs0320-f25/typescript-csv-ydtqhd
