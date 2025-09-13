# 1.

Give me a quote with multiple lines

quote,speaker,location,date
I have a dream.,Martin Luther King Jr.,"Washington, D.C.",1963-08-28
"That's one small step for man, one giant leap for mankind.",Neil Armstrong,Moon (Apollo 11),1969-07-20
"Mr. Gorbachev, tear down this wall!",Ronald Reagan,Berlin,1987-06-12

---

Here’s one that spans multiple lines in the same format:

```
"Ask not what your country can do for you—
ask what you can do for your country.",
John F. Kennedy,
Washington, D.C.,
1961-01-20
```

Want me to give you a few more multi-line quotes in that CSV style?

# 2.1

I’m working on a CSV parser in TypeScript that currently accepts a filename as input and converts rows into strings or objects. What are some missing features or edge cases that I should consider? What improvements would make it easier for other developers to use in different kinds of apps?

---

Awesome project! CSVs look simple… until they aren’t. Here’s a pragmatic checklist of gaps, edge-cases, and DX improvements that’ll make your parser solid for real-world apps.

What CSVs throw at you (edge cases)
	•	Newlines: \n, \r\n, and rare lone \r. Newlines inside quoted fields (RFC 4180) must be preserved.
	•	Quotes & escapes: Embedded quotes (He said ""hi""), escaped delimiters inside quotes, and odd files that use backslash escaping.
	•	Delimiters: Comma, semicolon (EU), tab (TSV), pipe, custom. Consider auto-detect from first N lines.
	•	Headers: Missing header row; duplicate header names; empty headers; trimming; case normalization; header renaming; header order changes.
	•	Row arity: Short rows, long rows, trailing commas, ragged files. Policy options: pad, truncate, error, sparse.
	•	Empty lines & comments: Skip blank lines; allow comment prefix (e.g., #, //).
	•	Whitespace: Trim around unquoted fields but not inside quoted ones; handle non-breaking spaces.
	•	BOM & encodings: UTF-8 BOM, UTF-16LE/BE, ISO-8859-1, Shift-JIS, etc. Allow user-supplied TextDecoder or encoding hint.
	•	End-of-file quirks: No trailing newline; last field unterminated.
	•	Very large values: Extremely wide fields; memory pressure when a single field is megabytes long.
	•	Variable quoting styles: Always quote, minimal quote, rarely “quote none” (not RFC). Make behavior explicit.
	•	Locale numerics: 1,234.56 vs 1.234,56; dates in multiple formats; "TRUE"/"FALSE" vs 1/0.
	•	Gzipped/Compressed input: .gz, .zip (single entry) streaming support.
	•	CSV injection: Fields beginning with =, +, -, @ can trigger formulas in spreadsheets. Provide a safe mode to prefix with ' or filter.
	•	Null/undefined semantics: Distinguish empty string "", missing field, and null.
	•	Extremely long files: >2GB, millions of rows—require streaming, backpressure, and chunked parsing.

API surface that scales (input & output)
	•	Inputs beyond filename: string, Blob/File, ArrayBuffer/Uint8Array, WHATWG ReadableStream, Node Readable, URL (fetch), async iterator. Optional transparent gzip.
	•	Streaming outputs:
	•	Async iterator of rows: for await (const row of parse(stream)) { … }
	•	Node stream mode (object mode)
	•	Web Streams API ReadableStream<Record<string, unknown>>
	•	Pull vs push: Support both callback/event (“row”, “error”, “end”) and pull-based iteration.
	•	Abort & cancel: AbortSignal to stop mid-parse; expose bytes/rows read.
	•	Backpressure: Honor consumer demand with async iterators/Web Streams.
	•	Type modes:
	•	Raw: all strings
	•	Typed: numbers/booleans/dates via user-supplied parsers
	•	Schema-driven: validate/transform with Zod/Yup/Valibot (optional peer)
	•	Generics: parse<T>(…, { mapRow: (raw) => T })

Configuration you’ll want
	•	delimiter, quote, escape, newline, comment, skipEmptyLines
	•	headers: true | string[] | { rename: Record<string,string>, required: string[] }
	•	trimFields, trimHeaders
	•	encoding (or TextDecoder)
	•	allowRaggedRows: 'error' | 'pad' | 'truncate' | 'sparse'
	•	dynamicTyping: boolean | per-column map | per-column parser
	•	nullish: strings that should map to null (["NULL","NaN"])
	•	maxRowBytes, maxColumnCount (DoS protection)
	•	rowLimit, byteLimit
	•	onError: 'throw' | 'collect' | 'skip-row' (with recovery)
	•	safeForSpreadsheets: boolean (mitigate CSV injection)
	•	progress: (info) => void (bytes, rows, elapsed)
	•	rfc4180: boolean or “strict/relaxed” mode toggle
	•	autoDetect: { delimiter?: boolean, newline?: boolean, quote?: boolean }

Error handling & diagnostics
	•	Rich errors with line/column, byte offset, offending snippet, and error code (ERR_UNCLOSED_QUOTE, ERR_TOO_MANY_COLUMNS, …).
	•	Partial-row recovery strategies; emit an “anomaly” channel separate from fatal errors.
	•	Optional error report summary at the end (counts by type).

Performance considerations
	•	Zero-copy slicing within a chunk; avoid per-char string concatenation.
	•	SIMD/WASM optional fast-path (later).
	•	Chunk size tuning; incremental decoding from bytes→text to avoid splitting multi-byte code points.
	•	Bench suite + fixtures (small/medium/huge; many quotes; long fields).
	•	Node: use stream.Readable in object mode; Browser: TransformStream; support Web Workers to keep main thread free.

Security & resilience
	•	CSV formula injection guard (opt-in default on for browser).
	•	Resource limits (rows/bytes/time) with early abort.
	•	Don’t eval; treat schema parsers as pure; sanitize logs.
	•	Fuzz tests for unclosed quotes, malformed UTF-8, huge fields.

Developer experience (DX) upgrades
	•	Great types: exported ParseOptions, ParseError, Row, Schema<T>.
	•	JSDoc on every option + examples; generated docs site; copy-paste recipes.
	•	Tiny adapters:
	•	React hook: useCsv(file, opts) returning progress, rows, errors
	•	Node CLI: npx yourcsv in.csv --json --delimiter ';'
	•	Transform API: parse(...).pipe(toJSONLines()).pipe(fs.createWriteStream(...))
	•	Interoperability: ESM + CJS + Deno targets; "types" included; "exports" map; "sideEffects": false for tree-shaking.
	•	Plugins/hooks: beforeRow, afterRow, beforeField, afterField to customize parsing/typing.
	•	Batteries-included helpers: to JSON Lines, to arrays, column projection, distinct header validation, schema inference (lightweight).
	•	Abortable progress UI events (rows/sec, ETA).
	•	Localization: number/date parsers with locale or Intl options.
	•	Examples repo: Browser + Worker, Node streams, Deno, Cloudflare Workers.

Suggested TypeScript shape (concise)

export type ParseOptions<T = unknown> = {
  input:
    | string
    | Blob
    | ArrayBufferView
    | AsyncIterable<Uint8Array>
    | ReadableStream<Uint8Array>; // browser/deno
  delimiter?: string | 'auto';
  quote?: string; escape?: string;
  newline?: '\n' | '\r\n' | '\r' | 'auto';
  comment?: string | null;
  headers?: boolean | string[] | { rename?: Record<string,string>; required?: string[] };
  trimFields?: boolean; trimHeaders?: boolean;
  allowRaggedRows?: 'error'|'pad'|'truncate'|'sparse';
  encoding?: string | TextDecoder;
  dynamicTyping?:
    | boolean
    | Record<string, (s: string) => unknown>;
  nullish?: string[];
  rowLimit?: number; byteLimit?: number; maxRowBytes?: number; maxColumnCount?: number;
  safeForSpreadsheets?: boolean;
  autoDetect?: Partial<{ delimiter: boolean; newline: boolean }>;
  signal?: AbortSignal;
  onProgress?: (p: { bytes: number; rows: number; elapsedMs: number }) => void;
  onError?: (e: ParseError, ctx: { line: number; column: number }) => 'skip'|'throw';
  mapRow?: (row: Record<string,string>, i: number) => T;
  mode?: 'strict' | 'relaxed'; // RFC toggle
};

export declare function parse<T=Record<string,string>>(
  opts: ParseOptions<T>
): AsyncIterable<T> & { // dual: async iterator + helpers
  toArray(): Promise<T[]>;
  toStream(): ReadableStream<T>;
  summary(): Promise<{ rows: number; errors: ParseError[] }>;
};

export interface ParseError extends Error {
  code:
    | 'ERR_UNCLOSED_QUOTE'
    | 'ERR_TOO_MANY_COLUMNS'
    | 'ERR_TOO_FEW_COLUMNS'
    | 'ERR_INVALID_ENCODING'
    | 'ERR_LIMIT_EXCEEDED';
  line: number; column: number; offset: number; snippet?: string;
}

Transformations & typing patterns
	•	Per-column parsers: { dynamicTyping: { price: toNumber({ locale: 'de-DE' }), date: toDate('yyyy-MM-dd') } }
	•	Schema: parse<Product>({ mapRow: zodSchema.parse })
	•	Projection: { headers: true, mapRow: ({id,name,price}) => ({id, name, price: +price}) }
	•	Ragged rows to sparse: allowRaggedRows: 'sparse' ⇒ missing cells omitted.

Testing & quality
	•	Golden fixtures: RFC4180 conformance set, Excel exports, semicolon CSVs, quoted newlines, BOM/no-BOM, 1e6-row file.
	•	Property-based tests (fast-check) to generate random CSVs with constraints.
	•	Corpus fuzzing: randomized quotes/delimiters, malformed UTF-8.
	•	Differential tests vs another well-known parser to catch regressions.
	•	Cross-env CI: Node LTSes + major browsers (via playwright) + Deno.

Documentation that saves hours
	•	“Getting started” (Node/Browser/Worker/Deno).
	•	“Handling huge files” guide (streaming + backpressure).
	•	“Numbers/dates/locales” guide.
	•	“Security: CSV injection” note.
	•	“Common errors & recovery” table.
	•	Performance benchmarks with data + method to reproduce.

Quick wins you can add next
	1.	Add AsyncIterable output with AbortSignal.
	2.	Support Blob/File and ReadableStream inputs (browser) and Node streams.
	3.	Implement auto-detect delimiter/newline from first ~1–2KB.
	4.	Add safe-for-spreadsheets guard.
	5.	Rich errors with line/col and recoverable modes.
	6.	Ship a tiny CLI and a React hook sample to showcase API.

If you want, share a tiny snippet of your current API and I’ll map these into a concrete upgrade plan and minimal breaking changes.

# 2.2

I’m working on a CSV parser in TypeScript that currently accepts a filename as input and converts rows into strings or objects. What are some missing features or edge cases that I should consider? What improvements would make it easier for other developers to use in different kinds of apps? Avoid using domain-specific terms and abbreviation that might requires me to look it up.

---

Great project! Here’s a practical checklist of things that tend to bite CSV parsers in the wild, plus ways to make your package easier to drop into many apps.

Edge cases your parser should handle
	•	Different line endings: \n, \r\n, and the rare \r.
	•	Byte Order Mark (BOM): Strip \uFEFF if present at the start.
	•	Big files: Don’t load everything at once; support chunk-by-chunk reading.
	•	Different separators: Comma is common, but also ; and \t. Consider auto-detect with an override.
	•	Quoted fields: Respect quotes wrapping fields, including commas inside quotes.
	•	Escaped quotes: Two quotes inside a quoted field ("He said ""hi""") should become one.
	•	Multi-line fields: Quoted fields may contain line breaks that should not split the record.
	•	Spaces around separators: Decide whether to trim; make it an option.
	•	Empty lines and comment lines: Skip or keep; let the user choose (e.g., lines starting with #).
	•	Missing or extra columns: Fewer or more fields than headers; decide how to fill or report.
	•	Duplicate headers: Allow, disallow, or suffix with a counter.
	•	Header casing and cleanup: Options to keep as-is, lower-case, or a user-supplied rename map.
	•	Numbers and dates: "0012" (keep the zeros?), "1e3" (is that a number or text?), date strings that should stay as text unless asked to convert.
	•	Null-like values: Distinguish between empty string "", missing field, and words like "NULL" or "NaN"—only convert if asked.
	•	Very long fields: Protect against memory blow-ups; let users set max line/field sizes.
	•	Unicode: Emojis, combined characters, right-to-left text; test these.
	•	Last line without newline: Handle final row even if the file doesn’t end with \n.

Inputs and outputs to support (beyond a filename)
	•	Input sources:
	•	File path
	•	Raw string
	•	Buffer/Uint8Array
	•	Readable stream (Node)
	•	Web streams (browser, workers)
	•	URL/Response body (fetch)
	•	Output shapes:
	•	Array of arrays (rows as lists)
	•	Array of objects (rows as key/value)
	•	Async iterator / generator (row-by-row)
	•	Node/Web stream of rows
	•	Encodings: Allow setting input encoding; default to UTF-8.

Options that make behavior clear (and safe)

Here’s a simple, discoverable options shape:

export type CsvMode = "object" | "array";          // output shape
export type OnFieldError = "throw" | "coerce" | "skip";
export type OnRowError = "throw" | "skip" | "report";

export interface CsvOptions<T = Record<string, unknown>> {
  separator?: string;               // default: ","
  quote?: string;                   // default: '"'
  escape?: string;                  // default: '"' (double-quote escape)
  hasHeader?: boolean;              // default: true
  headers?: string[];               // override or supply headers
  trimFields?: boolean;             // default: true
  skipEmptyLines?: boolean;         // default: true
  commentPrefix?: string;           // e.g., "#"
  mode?: CsvMode;                   // default: "object"
  cast?: {                          // opt-in conversions
    numbers?: boolean;              // default: false
    booleans?: boolean;             // default: false ("true"/"false")
    dates?: (s: string) => Date | string;
    nulls?: (s: string) => null | undefined | string;
  };
  onFieldError?: OnFieldError;      // default: "throw"
  onRowError?: OnRowError;          // default: "throw"
  maxFieldLength?: number;          // bytes/characters; default: Infinity
  maxRowLength?: number;
  allowMalformedLastRow?: boolean;  // default: true
  renameHeaders?: (h: string, i: number) => string;
  select?: string[];                // pick columns
  drop?: string[];                  // drop columns
  signal?: AbortSignal;             // allow cancel
  onProgress?: (info: { bytesRead: number; rows: number }) => void;
  onRow?: (row: T | string[], index: number) => T | string[] | void | Promise<any>;
}

API shapes that feel good to other developers
	•	Single entry point with overloads:

parseCsv(source: string | Buffer | Readable | URL, options?: CsvOptions): Promise<Result>;
parseCsvSync(source: string | Buffer, options?: CsvOptions): Result;
parseCsvStream(source: Readable | WebReadable, options?: CsvOptions): AsyncIterable<Row>;


	•	Tiny “stringify” helper: Many apps need the reverse too.

toCsv(rows, { separator, quote, headers })


	•	Row transform hooks: onRow (sync or async) to map/validate rows as they stream through.
	•	Strict vs. forgiving mode: Flip a single flag that controls whether to throw or try to continue.
	•	Abort and progress: Respect AbortSignal; send occasional progress events for big files.
	•	Auto-detect helper: A function that peeks at the start of data to guess separator, quote, header presence.

Errors that help people fix problems fast
	•	Include line and column numbers, and the nearby text.
	•	Attach a machine-readable code (e.g., "UNEXPECTED_QUOTE", "BAD_COLUMN_COUNT").
	•	Offer a recovery hint in the message: “Field had 8 columns but header has 7. Consider allowMalformedLastRow or fix the source.”
	•	Let users choose error policy: throw, skip row, or try to fix.

Performance and memory
	•	Streaming by default for large inputs; collect into arrays only when asked.
	•	Backpressure-aware: don’t outpace the consumer when pushing rows.
	•	Chunk parser that keeps state across chunks (handles quotes crossing chunk boundaries).
	•	Zero-copy when possible: slice views instead of making many new strings (where safe).

TypeScript friendliness
	•	Strong types for rows:

interface Person { id: string; age: number; name: string; }
const rows = await parseCsv<Person>(file, { hasHeader: true, cast: { numbers: true }});


	•	Literal types for headers: If headers is provided as a tuple, infer the exact keys.
	•	Narrowed results: If mode: "array", return string[][]; if "object", return Record<string, unknown>[].

Cross-runtime support
	•	Node, browser, workers, Deno, Bun: Avoid Node-only APIs in core. Provide small adapters (e.g., one for Node streams, one for Web streams).
	•	No required polyfills by default; document optional ones if needed.

Safety limits (useful for untrusted input)
	•	Caps on row count, row length, and field length.
	•	Early stop after N errors with a helpful summary.
	•	Option to refuse rows with very deep nesting of quotes or repeated separators.

Developer experience and docs
	•	Clear README with “90-second” examples for:
	•	Parse entire file to objects
	•	Stream rows and write to a database
	•	Handle multi-line quoted fields
	•	Convert numbers and dates safely
	•	Parse in the browser from a file input
	•	Tiny cookbook: “skip empty lines”, “only some columns”, “auto-detect separator”, “abort long parse”.
	•	Good defaults (e.g., hasHeader: true, trimFields: true, skipEmptyLines: true) so basic usage is one line.
	•	Helpful errors by default, strictness opt-in.
	•	Playground snippet (StackBlitz/CodeSandbox) and a CLI example.

Testing suggestions
	•	Golden tests with weird cases: embedded quotes, many separators, very long fields, mixed endings, emojis.
	•	Fuzz tests that feed random text to ensure no crashes.
	•	Property tests: parse → stringify → parse should round-trip.
	•	Cross-file tests: tiny, large (GB-scale with generated data), with and without headers.

Nice to have
	•	Column type hints file: Allow a small map like { age: "number", createdAt: "date" }.
	•	Locale-aware number/date parsing (opt-in).
	•	Async “peek” API to read first N lines without consuming the stream.
	•	Metrics hook: total bytes, total rows, time taken.

---

If you want, I can sketch a minimal streaming core and an options-first wrapper that exposes the APIs above, so you can plug new features without touching the parser state machine.

# 2.3

I’m working on a CSV parser in TypeScript that currently accepts a filename as input and converts rows into strings or objects. What are some missing features or edge cases that I should consider? What improvements would make it easier for other developers to use in different kinds of apps? Explain domain-specific terms and abbreviation that might requires me to look up.

---

Great project! Here’s a practical checklist of things that tend to bite CSV parsers in the wild, plus ways to make your package easier to drop into many apps.

Edge cases your parser should handle
	•	Different line endings: \n, \r\n, and the rare \r.
	•	Byte Order Mark (BOM): Strip \uFEFF if present at the start.
	•	Big files: Don’t load everything at once; support chunk-by-chunk reading.
	•	Different separators: Comma is common, but also ; and \t. Consider auto-detect with an override.
	•	Quoted fields: Respect quotes wrapping fields, including commas inside quotes.
	•	Escaped quotes: Two quotes inside a quoted field ("He said ""hi""") should become one.
	•	Multi-line fields: Quoted fields may contain line breaks that should not split the record.
	•	Spaces around separators: Decide whether to trim; make it an option.
	•	Empty lines and comment lines: Skip or keep; let the user choose (e.g., lines starting with #).
	•	Missing or extra columns: Fewer or more fields than headers; decide how to fill or report.
	•	Duplicate headers: Allow, disallow, or suffix with a counter.
	•	Header casing and cleanup: Options to keep as-is, lower-case, or a user-supplied rename map.
	•	Numbers and dates: "0012" (keep the zeros?), "1e3" (is that a number or text?), date strings that should stay as text unless asked to convert.
	•	Null-like values: Distinguish between empty string "", missing field, and words like "NULL" or "NaN"—only convert if asked.
	•	Very long fields: Protect against memory blow-ups; let users set max line/field sizes.
	•	Unicode: Emojis, combined characters, right-to-left text; test these.
	•	Last line without newline: Handle final row even if the file doesn’t end with \n.

Inputs and outputs to support (beyond a filename)
	•	Input sources:
	•	File path
	•	Raw string
	•	Buffer/Uint8Array
	•	Readable stream (Node)
	•	Web streams (browser, workers)
	•	URL/Response body (fetch)
	•	Output shapes:
	•	Array of arrays (rows as lists)
	•	Array of objects (rows as key/value)
	•	Async iterator / generator (row-by-row)
	•	Node/Web stream of rows
	•	Encodings: Allow setting input encoding; default to UTF-8.

Options that make behavior clear (and safe)

Here’s a simple, discoverable options shape:

export type CsvMode = "object" | "array";          // output shape
export type OnFieldError = "throw" | "coerce" | "skip";
export type OnRowError = "throw" | "skip" | "report";

export interface CsvOptions<T = Record<string, unknown>> {
  separator?: string;               // default: ","
  quote?: string;                   // default: '"'
  escape?: string;                  // default: '"' (double-quote escape)
  hasHeader?: boolean;              // default: true
  headers?: string[];               // override or supply headers
  trimFields?: boolean;             // default: true
  skipEmptyLines?: boolean;         // default: true
  commentPrefix?: string;           // e.g., "#"
  mode?: CsvMode;                   // default: "object"
  cast?: {                          // opt-in conversions
    numbers?: boolean;              // default: false
    booleans?: boolean;             // default: false ("true"/"false")
    dates?: (s: string) => Date | string;
    nulls?: (s: string) => null | undefined | string;
  };
  onFieldError?: OnFieldError;      // default: "throw"
  onRowError?: OnRowError;          // default: "throw"
  maxFieldLength?: number;          // bytes/characters; default: Infinity
  maxRowLength?: number;
  allowMalformedLastRow?: boolean;  // default: true
  renameHeaders?: (h: string, i: number) => string;
  select?: string[];                // pick columns
  drop?: string[];                  // drop columns
  signal?: AbortSignal;             // allow cancel
  onProgress?: (info: { bytesRead: number; rows: number }) => void;
  onRow?: (row: T | string[], index: number) => T | string[] | void | Promise<any>;
}

API shapes that feel good to other developers
	•	Single entry point with overloads:

parseCsv(source: string | Buffer | Readable | URL, options?: CsvOptions): Promise<Result>;
parseCsvSync(source: string | Buffer, options?: CsvOptions): Result;
parseCsvStream(source: Readable | WebReadable, options?: CsvOptions): AsyncIterable<Row>;


	•	Tiny “stringify” helper: Many apps need the reverse too.

toCsv(rows, { separator, quote, headers })


	•	Row transform hooks: onRow (sync or async) to map/validate rows as they stream through.
	•	Strict vs. forgiving mode: Flip a single flag that controls whether to throw or try to continue.
	•	Abort and progress: Respect AbortSignal; send occasional progress events for big files.
	•	Auto-detect helper: A function that peeks at the start of data to guess separator, quote, header presence.

Errors that help people fix problems fast
	•	Include line and column numbers, and the nearby text.
	•	Attach a machine-readable code (e.g., "UNEXPECTED_QUOTE", "BAD_COLUMN_COUNT").
	•	Offer a recovery hint in the message: “Field had 8 columns but header has 7. Consider allowMalformedLastRow or fix the source.”
	•	Let users choose error policy: throw, skip row, or try to fix.

Performance and memory
	•	Streaming by default for large inputs; collect into arrays only when asked.
	•	Backpressure-aware: don’t outpace the consumer when pushing rows.
	•	Chunk parser that keeps state across chunks (handles quotes crossing chunk boundaries).
	•	Zero-copy when possible: slice views instead of making many new strings (where safe).

TypeScript friendliness
	•	Strong types for rows:

interface Person { id: string; age: number; name: string; }
const rows = await parseCsv<Person>(file, { hasHeader: true, cast: { numbers: true }});


	•	Literal types for headers: If headers is provided as a tuple, infer the exact keys.
	•	Narrowed results: If mode: "array", return string[][]; if "object", return Record<string, unknown>[].

Cross-runtime support
	•	Node, browser, workers, Deno, Bun: Avoid Node-only APIs in core. Provide small adapters (e.g., one for Node streams, one for Web streams).
	•	No required polyfills by default; document optional ones if needed.

Safety limits (useful for untrusted input)
	•	Caps on row count, row length, and field length.
	•	Early stop after N errors with a helpful summary.
	•	Option to refuse rows with very deep nesting of quotes or repeated separators.

Developer experience and docs
	•	Clear README with “90-second” examples for:
	•	Parse entire file to objects
	•	Stream rows and write to a database
	•	Handle multi-line quoted fields
	•	Convert numbers and dates safely
	•	Parse in the browser from a file input
	•	Tiny cookbook: “skip empty lines”, “only some columns”, “auto-detect separator”, “abort long parse”.
	•	Good defaults (e.g., hasHeader: true, trimFields: true, skipEmptyLines: true) so basic usage is one line.
	•	Helpful errors by default, strictness opt-in.
	•	Playground snippet (StackBlitz/CodeSandbox) and a CLI example.

Testing suggestions
	•	Golden tests with weird cases: embedded quotes, many separators, very long fields, mixed endings, emojis.
	•	Fuzz tests that feed random text to ensure no crashes.
	•	Property tests: parse → stringify → parse should round-trip.
	•	Cross-file tests: tiny, large (GB-scale with generated data), with and without headers.

Nice to have
	•	Column type hints file: Allow a small map like { age: "number", createdAt: "date" }.
	•	Locale-aware number/date parsing (opt-in).
	•	Async “peek” API to read first N lines without consuming the stream.
	•	Metrics hook: total bytes, total rows, time taken.

⸻

If you want, I can sketch a minimal streaming core and an options-first wrapper that exposes the APIs above, so you can plug new features without touching the parser state machine.
