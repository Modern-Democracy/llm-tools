# Web UI Module

This module specifies a low-dependency local project model viewer/editor.

## Runtime

- Node HTTP service.
- Static HTML, CSS, and first-party JavaScript.
- No frontend framework in v1.
- Browser reads generated JSON through the Node service.
- Browser writes patch proposals through local-admin API endpoints.

## Required API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/project-model` | Return rendered project model JSON. |
| `GET` | `/api/project-model/patches` | List pending patch proposals. |
| `POST` | `/api/project-model/patches` | Save a patch proposal without editing canonical files. |

## Required Screens

| Route | Purpose |
| --- | --- |
| `/project-model` | Inspect modules, APIs, screens, workflows, decisions, generated status, and patch proposals. |

## States

- loading
- ready
- empty
- missing generated model
- invalid model
- patch pending
- API error

## Sources

- `modules/core/project/apis/project-model.yaml`
- `modules/core/project/screens/project-model-viewer.yaml`
