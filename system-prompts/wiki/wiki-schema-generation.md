### Meta-Prompt for Wiki Schema Generation

**Objective**: Create a `AGENTS.md` document that defines the schema, directory layout, and maintenance workflows for a folder-based markdown wiki intended for LLM ingestion and human reference.

**Instructions**:
1. **Define the Layering**: Establish a three-tier architecture consisting of **Raw Sources** (immutable project files), the **Wiki** (LLM-maintained synthesis), and the **Schema** (the document being created).
2. **Specify Directory Layout**: Define a structured `wiki/` directory including:
    * `index.md`: The central content catalog.
    * `log.md`: An append-only chronological record of ingests and queries.
    * `sources/`: Individual pages summarizing raw documentation.
    * `domain/` (replace domain with category): Categories specific to the project's technical and conceptual domains.
3. **Establish Page Conventions**: 
    * Require a one-sentence purpose line at the top.
    * Mandate citations at the bottom using a `## Sources` section.
    * Enforce a ~300-line limit before splitting pages.
    * Prescribe frontmatter containing `type`, `tags`, and `updated` fields.
4. **Define Core Workflows**:
    * **Ingest**: Procedures for reading new sources, discussing takeaways, and propagating changes across 5–15 related pages.
    * **Query**: A "Map-to-Mine" strategy (Read index -> Drill into pages -> Synthesize -> File back new findings).
    * **Lint**: Rules for identifying contradictions, orphan pages, and stale data.
5. **Set Ingest Priorities**: Create a section for "High-Value Targets" that lists existing project files not yet fully integrated into the wiki.
6. **Formatting Constraints**:
    * Use relative markdown links `[Title](./path/page.md)` exclusively.
    * Avoid Obsidian-specific `[[wikilinks]]`.
    * Ensure the response is scannable with clear headers and code blocks.
