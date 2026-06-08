#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const templateRoot = path.resolve(path.dirname(scriptPath), "..");
const repoRoot = path.resolve(templateRoot, "..", "..");
const buildRoot = path.join(repoRoot, "build", "project-templates", "llm-assisted-software");

const canonicalFiles = {
  manifest: "template.yaml",
  model: "modules/core/project/model.yaml",
  api: "modules/core/project/apis/project-model.yaml",
  screen: "modules/core/project/screens/project-model-viewer.yaml",
  workflow: "modules/core/project/workflows/role-gated-delivery.yaml"
};

const schemaFiles = {
  manifest: "schemas/template-manifest.schema.json",
  model: "schemas/project-model.schema.json",
  api: "schemas/api-contract.schema.json",
  screen: "schemas/screen-contract.schema.json",
  workflow: "schemas/workflow.schema.json",
  patch: "schemas/patch-proposal.schema.json"
};

const command = process.argv[2] || "help";

try {
  if (command === "validate") {
    const report = validateTemplate();
    writeJson(path.join(buildRoot, "validation-report.json"), report);
    printReport(report);
    process.exit(report.errors.length ? 1 : 0);
  }

  if (command === "render") {
    const report = validateTemplate();
    writeJson(path.join(buildRoot, "validation-report.json"), report);
    if (report.errors.length) {
      printReport(report);
      process.exit(1);
    }
    renderTemplate(report);
    printReport(report);
    process.exit(0);
  }

  if (command === "wiki-lint") {
    const report = {
      command: "wiki-lint",
      ok: true,
      errors: [],
      warnings: [],
      checks: []
    };
    lintWiki(report);
    report.ok = report.errors.length === 0;
    writeJson(path.join(buildRoot, "validation-report.json"), report);
    printReport(report);
    process.exit(report.errors.length ? 1 : 0);
  }

  if (command === "doctor") {
    writeStdout(JSON.stringify(doctor(), null, 2));
    process.exit(0);
  }

  if (command === "backup") {
    const report = backupTemplate();
    writeStdout(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (command === "restore") {
    writeStdout("restore requires an explicit backup path and is intentionally not automatic in v1");
    process.exit(0);
  }

  if (command === "upgrade-check") {
    const report = {
      command: "upgrade-check",
      status: "reserved",
      message: "No upgrade source was provided. V1 records the command boundary only."
    };
    writeJson(path.join(buildRoot, "upgrade-check.json"), report);
    writeStdout(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  writeStdout(`Usage: node ${relativeToRepo(scriptPath)} <validate|render|wiki-lint|doctor|backup|restore|upgrade-check>`);
  process.exit(command === "help" ? 0 : 1);
} catch (error) {
  writeStdout(error.stack || String(error));
  process.exit(1);
}

function validateTemplate() {
  const report = {
    command: "validate",
    template_root: relativeToRepo(templateRoot),
    generated_root: relativeToRepo(buildRoot),
    ok: true,
    errors: [],
    warnings: [],
    checks: []
  };

  const schemas = loadSchemas(report);
  const parsed = {};

  for (const [key, relPath] of Object.entries(canonicalFiles)) {
    const filePath = path.join(templateRoot, relPath);
    if (!existsSync(filePath)) {
      report.errors.push(`${relPath}: missing canonical file`);
      continue;
    }
    parsed[key] = readYamlFile(relPath);
    validateAgainstSchema(parsed[key], schemas[key], relPath, report);
    report.checks.push(`${relPath}: parsed and schema checked`);
  }

  if (parsed.manifest) {
    validateManifestPaths(parsed.manifest, report);
  }

  if (parsed.manifest && parsed.model) {
    validateModelReferences(parsed.manifest, parsed.model, report);
  }

  if (parsed.api && parsed.screen) {
    const linkedApis = new Set(parsed.screen.linked_apis || []);
    if (!linkedApis.has(parsed.api.api_key)) {
      report.errors.push(`${canonicalFiles.screen}: linked_apis must include ${parsed.api.api_key}`);
    }
  }

  validatePatchProposals(schemas.patch, report);
  lintWiki(report);

  report.ok = report.errors.length === 0;
  return report;
}

function loadSchemas(report) {
  const schemas = {};
  for (const [key, relPath] of Object.entries(schemaFiles)) {
    const filePath = path.join(templateRoot, relPath);
    if (!existsSync(filePath)) {
      report.errors.push(`${relPath}: missing schema file`);
      continue;
    }
    try {
      schemas[key] = JSON.parse(readFileSync(filePath, "utf8"));
      report.checks.push(`${relPath}: JSON parsed`);
    } catch (error) {
      report.errors.push(`${relPath}: invalid JSON schema: ${error.message}`);
    }
  }
  return schemas;
}

function validateManifestPaths(manifest, report) {
  const moduleKeys = new Set();
  for (const module of manifest.modules || []) {
    if (moduleKeys.has(module.key)) {
      report.errors.push(`${canonicalFiles.manifest}: duplicate module key ${module.key}`);
    }
    moduleKeys.add(module.key);
    const modulePath = path.join(templateRoot, module.path || "");
    if (!existsSync(modulePath)) {
      report.errors.push(`${canonicalFiles.manifest}: module path missing for ${module.key}: ${module.path}`);
    }
  }

  for (const relPath of manifest.artifacts?.canonical || []) {
    if (!existsSync(path.join(templateRoot, relPath))) {
      report.errors.push(`${canonicalFiles.manifest}: canonical artifact missing: ${relPath}`);
    }
  }

  const expectedRoot = "build/project-templates/llm-assisted-software";
  if (manifest.generated_root !== expectedRoot) {
    report.errors.push(`${canonicalFiles.manifest}: generated_root must be ${expectedRoot}`);
  }
}

function validateModelReferences(manifest, model, report) {
  const manifestModules = new Set((manifest.modules || []).map((module) => module.key));
  for (const moduleKey of model.modules || []) {
    if (!manifestModules.has(moduleKey)) {
      report.errors.push(`${canonicalFiles.model}: unknown module reference ${moduleKey}`);
    }
  }

  const requiredRoles = ["Project Management", "QA Reviewer"];
  const modelRoles = new Set(model.lifecycle?.roles || []);
  for (const role of requiredRoles) {
    if (!modelRoles.has(role)) {
      report.errors.push(`${canonicalFiles.model}: lifecycle.roles must include ${role}`);
    }
  }
}

function validatePatchProposals(schema, report) {
  const patchesDir = path.join(templateRoot, "patches");
  if (!existsSync(patchesDir)) {
    report.errors.push("patches: missing patch output directory");
    return;
  }

  const patchFiles = listFiles(patchesDir).filter((file) => file.endsWith(".json"));
  for (const filePath of patchFiles) {
    const relPath = relativeToTemplate(filePath);
    try {
      const patch = JSON.parse(readFileSync(filePath, "utf8"));
      validateAgainstSchema(patch, schema, relPath, report);
      report.checks.push(`${relPath}: patch proposal schema checked`);
    } catch (error) {
      report.errors.push(`${relPath}: invalid patch proposal JSON: ${error.message}`);
    }
  }
}

function lintWiki(report) {
  const wikiDir = path.join(templateRoot, "wiki-scaffold");
  if (!existsSync(wikiDir)) {
    report.errors.push("wiki-scaffold: missing wiki scaffold directory");
    return;
  }

  const pages = listFiles(wikiDir).filter((file) => file.endsWith(".md"));
  for (const page of pages) {
    const relPath = relativeToTemplate(page);
    const text = readFileSync(page, "utf8");
    if (!text.startsWith("---\n")) {
      report.errors.push(`${relPath}: missing frontmatter`);
    }
    if (!/\nupdated: \d{4}-\d{2}-\d{2}\n/.test(text)) {
      report.errors.push(`${relPath}: missing updated date`);
    }
    if (!/\n## Sources\n/.test(text)) {
      report.errors.push(`${relPath}: missing ## Sources section`);
    }
    const absoluteLink = text.match(/\]\((?:https?:|file:|[A-Za-z]:\\)/);
    if (absoluteLink) {
      report.errors.push(`${relPath}: internal wiki links must be relative`);
    }
    report.checks.push(`${relPath}: wiki conventions checked`);
  }
}

function renderTemplate(report) {
  const manifest = readYamlFile(canonicalFiles.manifest);
  const model = readYamlFile(canonicalFiles.model);
  const api = readYamlFile(canonicalFiles.api);
  const screen = readYamlFile(canonicalFiles.screen);
  const workflow = readYamlFile(canonicalFiles.workflow);
  const decisions = listFiles(path.join(templateRoot, "modules", "core", "project", "decisions"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      key: path.basename(file, ".md"),
      source_path: relativeToTemplate(file),
      title: firstMarkdownHeading(file)
    }));
  const wikiPages = listFiles(path.join(templateRoot, "wiki-scaffold"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      key: path.basename(file, ".md").toLowerCase(),
      source_path: relativeToTemplate(file),
      title: firstMarkdownHeading(file)
    }));
  const sourceFiles = Object.values(canonicalFiles)
    .concat(Object.values(schemaFiles))
    .concat(decisions.map((decision) => decision.source_path))
    .concat(wikiPages.map((page) => page.source_path))
    .sort()
    .map((relPath) => ({
      path: relPath,
      sha256: sha256File(path.join(templateRoot, relPath))
    }));

  const projectModel = stableObject({
    schema_version: 1,
    generated_at: "deterministic",
    generated_by: "project-templates/llm-assisted-software/tools/llm-template.mjs",
    template: manifest,
    project: model,
    apis: [api],
    screens: [screen],
    workflows: [workflow],
    decisions,
    wiki_pages: wikiPages,
    source_files: sourceFiles,
    validation: {
      ok: report.ok,
      error_count: report.errors.length,
      warning_count: report.warnings.length
    }
  });

  const graph = buildGraph(projectModel);

  writeJson(path.join(buildRoot, "project-model.json"), projectModel);
  writeJson(path.join(buildRoot, "project-model.graph.json"), graph);
  writeJson(path.join(buildRoot, "generated-web-model", "project-model-app.json"), {
    generated_at: "deterministic",
    modules: projectModel.template.modules,
    apis: projectModel.apis,
    screens: projectModel.screens,
    workflows: projectModel.workflows
  });
  copyDir(path.join(templateRoot, "wiki-scaffold"), path.join(buildRoot, "generated-wiki-preview"));
  copyFile(
    path.join(templateRoot, "modules", "database-postgres", "schema.sql"),
    path.join(buildRoot, "generated-db", "001_project_model_schema.sql")
  );
}

function buildGraph(projectModel) {
  const nodes = [];
  const edges = [];
  const addNode = (id, type, label, sourcePath) => nodes.push({ id, type, label, source_path: sourcePath || null });
  const addEdge = (from, to, label) => edges.push({ from, to, label });

  addNode("template:llm-assisted-software", "template", projectModel.template.name, "template.yaml");
  addNode(`project:${projectModel.project.project.key}`, "project", projectModel.project.project.name, canonicalFiles.model);
  addEdge("template:llm-assisted-software", `project:${projectModel.project.project.key}`, "defines");

  for (const module of projectModel.template.modules || []) {
    const id = `module:${module.key}`;
    addNode(id, "module", module.key, module.path);
    addEdge("template:llm-assisted-software", id, module.required ? "requires" : "offers");
  }

  for (const api of projectModel.apis || []) {
    const id = `api:${api.api_key}`;
    addNode(id, "api", api.api_key, canonicalFiles.api);
    addEdge("module:web-ui", id, "serves");
  }

  for (const screen of projectModel.screens || []) {
    const id = `screen:${screen.screen_key}`;
    addNode(id, "screen", screen.route, canonicalFiles.screen);
    for (const apiKey of screen.linked_apis || []) {
      addEdge(id, `api:${apiKey}`, "uses");
    }
  }

  for (const workflow of projectModel.workflows || []) {
    const id = `workflow:${workflow.workflow_key}`;
    addNode(id, "workflow", workflow.workflow_key, canonicalFiles.workflow);
    for (const step of workflow.steps || []) {
      const roleId = `role:${slug(step.role)}`;
      addNode(roleId, "role", step.role, null);
      addEdge(id, roleId, "gates");
    }
  }

  return stableObject({ schema_version: 1, generated_at: "deterministic", nodes, edges });
}

function backupTemplate() {
  const backupDir = path.join(buildRoot, "backups", "llm-assisted-software-current");
  rmSync(backupDir, { recursive: true, force: true });
  mkdirSync(backupDir, { recursive: true });
  copyDir(templateRoot, backupDir, (filePath) => !filePath.includes(`${path.sep}tools${path.sep}`));
  return {
    command: "backup",
    status: "created",
    path: relativeToRepo(backupDir)
  };
}

function doctor() {
  return {
    command: "doctor",
    cwd: process.cwd(),
    repo_root: repoRoot,
    template_root_exists: existsSync(templateRoot),
    build_root: buildRoot,
    node: process.version,
    git_status: safeGitStatus()
  };
}

function safeGitStatus() {
  try {
    return execFileSync("git", ["status", "--short", "--branch"], {
      cwd: repoRoot,
      encoding: "utf8"
    }).trim();
  } catch (error) {
    return `unavailable: ${error.message}`;
  }
}

function validateAgainstSchema(value, schema, relPath, report, pointer = "") {
  if (!schema) {
    report.errors.push(`${relPath}: schema unavailable`);
    return;
  }

  const location = pointer || "$";
  if (schema.type && !matchesType(value, schema.type)) {
    report.errors.push(`${relPath}:${location}: expected ${schema.type}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    report.errors.push(`${relPath}:${location}: expected one of ${schema.enum.join(", ")}`);
  }

  if (schema.pattern && typeof value === "string" && !(new RegExp(schema.pattern).test(value))) {
    report.errors.push(`${relPath}:${location}: value does not match ${schema.pattern}`);
  }

  if (schema.minLength !== undefined && typeof value === "string" && value.length < schema.minLength) {
    report.errors.push(`${relPath}:${location}: string shorter than ${schema.minLength}`);
  }

  if (schema.minimum !== undefined && typeof value === "number" && value < schema.minimum) {
    report.errors.push(`${relPath}:${location}: number below ${schema.minimum}`);
  }

  if (schema.minItems !== undefined && Array.isArray(value) && value.length < schema.minItems) {
    report.errors.push(`${relPath}:${location}: array shorter than ${schema.minItems}`);
  }

  if (schema.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (!(key in value)) {
        report.errors.push(`${relPath}:${location}: missing required property ${key}`);
      }
    }

    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (key in value) {
        validateAgainstSchema(value[key], childSchema, relPath, report, `${location}.${key}`);
      }
    }
  }

  if (schema.type === "array" && Array.isArray(value) && schema.items) {
    value.forEach((item, index) => {
      validateAgainstSchema(item, schema.items, relPath, report, `${location}[${index}]`);
    });
  }
}

function matchesType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "string") return typeof value === "string";
  if (type === "boolean") return typeof value === "boolean";
  return true;
}

function readYamlFile(relPath) {
  return parseYaml(readFileSync(path.join(templateRoot, relPath), "utf8"));
}

function parseYaml(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((raw, index) => ({
      indent: raw.match(/^ */)[0].length,
      text: raw.trim(),
      line: index + 1
    }))
    .filter((line) => line.text && !line.text.startsWith("#"));

  if (!lines.length) return {};
  const [value, index] = parseYamlBlock(lines, 0, lines[0].indent);
  if (index < lines.length) {
    throw new Error(`YAML parse stopped at line ${lines[index].line}`);
  }
  return value;
}

function parseYamlBlock(lines, start, indent) {
  if (lines[start]?.text.startsWith("- ")) {
    return parseYamlArray(lines, start, indent);
  }
  return parseYamlObject(lines, start, indent);
}

function parseYamlObject(lines, start, indent) {
  const obj = {};
  let index = start;
  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) break;
    if (line.indent > indent) {
      throw new Error(`Unexpected indentation at line ${line.line}`);
    }
    if (line.text.startsWith("- ")) break;

    const pair = splitYamlPair(line.text, line.line);
    index += 1;

    if (pair.value === "") {
      if (index < lines.length && lines[index].indent > indent) {
        const parsed = parseYamlBlock(lines, index, lines[index].indent);
        obj[pair.key] = parsed[0];
        index = parsed[1];
      } else {
        obj[pair.key] = {};
      }
    } else {
      obj[pair.key] = parseYamlScalar(pair.value);
    }
  }
  return [obj, index];
}

function parseYamlArray(lines, start, indent) {
  const arr = [];
  let index = start;
  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) break;
    if (line.indent > indent) {
      throw new Error(`Unexpected indentation at line ${line.line}`);
    }
    if (!line.text.startsWith("- ")) break;

    const content = line.text.slice(2).trim();
    index += 1;

    if (!content) {
      const parsed = parseYamlBlock(lines, index, lines[index].indent);
      arr.push(parsed[0]);
      index = parsed[1];
      continue;
    }

    if (looksLikeYamlPair(content)) {
      const obj = {};
      const pair = splitYamlPair(content, line.line);
      if (pair.value === "") {
        if (index < lines.length && lines[index].indent > indent) {
          const parsed = parseYamlBlock(lines, index, lines[index].indent);
          obj[pair.key] = parsed[0];
          index = parsed[1];
        } else {
          obj[pair.key] = {};
        }
      } else {
        obj[pair.key] = parseYamlScalar(pair.value);
      }

      if (index < lines.length && lines[index].indent > indent) {
        const parsed = parseYamlObject(lines, index, lines[index].indent);
        Object.assign(obj, parsed[0]);
        index = parsed[1];
      }
      arr.push(obj);
      continue;
    }

    arr.push(parseYamlScalar(content));
  }
  return [arr, index];
}

function splitYamlPair(text, line) {
  const separator = text.indexOf(":");
  if (separator === -1) {
    throw new Error(`Expected key/value pair at line ${line}`);
  }
  return {
    key: text.slice(0, separator).trim(),
    value: text.slice(separator + 1).trim()
  };
}

function looksLikeYamlPair(text) {
  const separator = text.indexOf(":");
  return separator > 0 && /^[A-Za-z0-9_-]+$/.test(text.slice(0, separator).trim());
}

function parseYamlScalar(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return Number.parseFloat(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const result = [];
  for (const entry of readdirSync(dir)) {
    const filePath = path.join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      result.push(...listFiles(filePath));
    } else {
      result.push(filePath);
    }
  }
  return result.sort();
}

function copyDir(source, target, include = () => true) {
  if (!existsSync(source)) return;
  rmSync(target, { recursive: true, force: true });
  for (const filePath of listFiles(source)) {
    if (!include(filePath)) continue;
    const relPath = path.relative(source, filePath);
    copyFile(filePath, path.join(target, relPath));
  }
}

function copyFile(source, target) {
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, readFileSync(source));
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(stableObject(value), null, 2)}\n`, "utf8");
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableObject(value[key])]));
  }
  return value;
}

function sha256File(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function firstMarkdownHeading(filePath) {
  const text = readFileSync(filePath, "utf8");
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.basename(filePath);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function relativeToRepo(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function relativeToTemplate(filePath) {
  return path.relative(templateRoot, filePath).replace(/\\/g, "/");
}

function printReport(report) {
  writeStdout(JSON.stringify({
    ok: report.ok,
    errors: report.errors,
    warnings: report.warnings,
    check_count: report.checks.length,
    generated_root: report.generated_root
  }, null, 2));
}

function writeStdout(text) {
  process.stdout.write(`${text}\n`);
}
