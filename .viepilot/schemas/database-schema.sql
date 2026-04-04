-- ViePilot v3 logical persistence schema
-- Local-first reference only. ViePilot does not require a relational database at runtime.

CREATE TABLE planning_source (
  id TEXT PRIMARY KEY,
  artifact_version TEXT NOT NULL,
  artifact_path TEXT NOT NULL,
  milestone_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  brainstorm_session_id TEXT NOT NULL,
  planning_json TEXT NOT NULL
);

CREATE TABLE runtime_state (
  id TEXT PRIMARY KEY,
  planning_source_id TEXT NOT NULL,
  executor_status TEXT NOT NULL,
  current_phase TEXT,
  current_task TEXT,
  control_point_active INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (planning_source_id) REFERENCES planning_source(id)
);

CREATE TABLE execution_graph (
  id TEXT PRIMARY KEY,
  planning_source_id TEXT NOT NULL,
  graph_version TEXT NOT NULL,
  graph_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (planning_source_id) REFERENCES planning_source(id)
);

CREATE TABLE active_packet (
  id TEXT PRIMARY KEY,
  runtime_state_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  packet_json TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  FOREIGN KEY (runtime_state_id) REFERENCES runtime_state(id)
);

CREATE INDEX idx_runtime_state_phase_task
  ON runtime_state(current_phase, current_task);

CREATE INDEX idx_active_packet_runtime_state
  ON active_packet(runtime_state_id);
