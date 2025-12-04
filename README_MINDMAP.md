# Mindmap Feature QA & Manual Testing Guide

## Overview
The Mindmap feature allows users to generate, view, edit, and save concept maps from their documents or topics. It supports versioning (snapshots), auto-layout, and linking back to source documents.

## QA Checklist

### 1. Mindmap Generation
- [ ] **Generate from Topic**:
  - Go to Mindmap page.
  - Enter a topic (e.g., "Photosynthesis") without selecting a document.
  - Click "Generate".
  - Verify a mindmap is created with nodes and edges.
- [ ] **Generate from Document**:
  - Select a document from the dropdown.
  - Click "Generate".
  - Verify mindmap is created based on document content.

### 2. Canvas Interaction
- [ ] **Navigation**:
  - Pan and zoom the canvas.
  - Use the MiniMap to navigate.
- [ ] **Node Editing**:
  - Double-click a node to edit its label.
  - Verify changes persist after clicking away.
- [ ] **Node Operations**:
  - Hover over a node to see the toolbar.
  - Click "+" to add a child node.
  - Click "Trash" icon to delete a node.
  - Verify child node is connected to parent.
- [ ] **Drag & Drop**:
  - Drag nodes to rearrange them.
- [ ] **Auto Layout**:
  - Rearrange nodes messily.
  - Click "Auto Layout" button.
  - Verify nodes are organized hierarchically.

### 3. Persistence & Versioning
- [ ] **Saving**:
  - Make changes (move nodes, edit text).
  - Click "Save".
  - Refresh page.
  - Verify changes are preserved.
- [ ] **Snapshots**:
  - Click "History" -> "Create Snapshot".
  - Make more changes and Save.
  - Click "History" and select the previous snapshot.
  - Verify the canvas reverts to the snapshot state.

### 4. Sidebar & Management
- [ ] **List View**:
  - Verify all mindmaps are listed in the sidebar.
  - Verify search filters the list by name.
- [ ] **Selection**:
  - Click different mindmaps in the sidebar.
  - Verify the canvas updates to show the selected mindmap.
- [ ] **Deletion**:
  - Click the trash icon on a sidebar item.
  - Verify the mindmap is removed from the list and canvas (if selected).

### 5. PDF Integration (If applicable)
- [ ] **Open Source**:
  - If a node has a source link, click the "External Link" icon.
  - Verify it navigates to the PDF viewer (if implemented).

## API Testing (Curl Examples)

### List Mindmaps
```bash
curl -X GET http://localhost:5000/api/mindmaps \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### Create Mindmap
```bash
curl -X POST http://localhost:5000/api/mindmaps \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{"name": "Test Map", "graph": {"nodes": [], "edges": []}}'
```

### Create Snapshot
```bash
curl -X POST http://localhost:5000/api/mindmaps/MINDMAP_ID/snapshot \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{"graph": {"nodes": [], "edges": []}, "note": "Backup"}'
```

## Revert Instructions
To revert the changes:
1. Delete `client/src/components/mindmap` directory.
2. Delete `client/src/lib/mindmapUtils.ts`.
3. Revert `client/src/pages/mindmap.tsx` to previous version.
4. Remove `server/routes/mindmaps.ts` and its registration in `server/routes.ts`.
5. Revert `shared/schema.ts` changes (drop `mindmaps` and `mindmap_snapshots` tables).
