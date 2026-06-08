async function loadProjectModel() {
  const status = document.getElementById("model-status");
  try {
    const response = await fetch("/api/project-model");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const model = await response.json();
    status.textContent = `Generated ${model.generated_at || "unknown"}`;
    renderList("modules", model.template.modules || [], (module) => [
      module.key,
      module.summary || module.path || ""
    ]);
    renderList("contracts", model.apis || [], (api) => [
      api.api_key,
      api.purpose
    ]);
    renderList("workflows", model.workflows || [], (workflow) => [
      workflow.workflow_key,
      workflow.purpose
    ]);
  } catch (error) {
    status.textContent = `Unable to load model: ${error.message}`;
  }
}

function renderList(id, rows, mapRow) {
  const root = document.getElementById(id);
  root.innerHTML = "";
  if (!rows.length) {
    root.textContent = "No records";
    return;
  }
  for (const row of rows) {
    const [title, detail] = mapRow(row);
    const item = document.createElement("div");
    item.className = "item";
    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    const detailNode = document.createElement("span");
    detailNode.textContent = detail;
    item.append(titleNode, detailNode);
    root.append(item);
  }
}

loadProjectModel();
