# Sprint 1: TypeScript CSV

### Task B: Proposing Enhancement

- #### Step 1: Brainstorm on your own.

    1. The current implementation incorrectly treats commas inside double quotes as delimiters.
    2. The current implementation cannot parse data rows that span multiple lines.
    3. The parser can let users specify and treat the first data row as column headers.
    4. The behavior of when parsing a malformed csv file is undefined.

- #### Step 2: Use an LLM to help expand your perspective.

    Using the given prompt with ChatGPT, its response covered all of my ideas.

    Additionally, it suggested considerations such as text file encoding and byte order marks, skipping empty lines, configurable dialects (e.g., delimiters and escape symbols), handling variable row lengths, and controlling how cell values are converted from raw text (e.g., as strings or based on a schema). It also pointed out newline style differences, error handling strategies, and distinctions between ESM vs. CJS imports. It also listed a good amount of test and edge cases. Beyond parsing, it gave suggestions on developer experience, security, and documentation. These may be outside the scope of this project.

    For the first variation, I modified the prompt to ask it to explain domain-specific terms and abbreviations. The response included more examples and detail, but the overall content remained similar. For the second variation, I specified that the project should remain light, simple, and manageable as a class assignment. It emphasized core areas while leaving out advanced or production level concerns. The response also organized features into must-have's and nice-to-have's, which made prioritization clearer. The examples were more practical, and the language was simpler and easier to follow.

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

### 1340 Supplement

- #### 1. Correctness

- #### 2. Random, On-Demand Generation

- #### 3. Overall experience, Bugs encountered and resolved
#### Errors/Bugs:
#### Tests:
#### How To…

#### Team members and contributions (include cs logins):
- Eddie Lin: `hlin82`

#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI):
- ChatGPT: Generated textual content for the test CSV files `quotes[....].csv` and `[....] double quote.csv`. Instructions were provided on the required column headers and the symbols to include in the main content fields.

#### Total estimated time it took to complete project:
#### Link to GitHub Repo: https://github.com/cs0320-f25/typescript-csv-ydtqhd
