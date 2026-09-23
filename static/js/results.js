// Real-2 per-trial results.
// Numbers are control steps; 1 step = 0.1 s.
// A trial is a success only when it is a bare number.
// An object is a failure: { f: <code>, s: <steps, if recorded>, n: <original note> }.
// Failure codes are defined in FAIL_CODES below.
// Each trial can have its own clip in static/videos/, named
//   real2_<config>_<case id>_<trial>.mp4   e.g. real2_stir_switch-2-4_5.mp4
// video-manifest.js lists the files that exist; cells without one are not clickable.

// Teaser clip at the top of the page: file name in static/videos/, "" = empty slot.
window.STIR_TEASER = "stir_overview.mp4";
window.STIR_TEASER_POSTER = "stir_overview_poster.jpg";
window.STIR_TEASER_CAPTION = "Overview video (2:57, with sound).";

window.STIR_FAIL_CODES = {
  old_goal: "Old-goal commitment",
  grasp: "Grasp failure",
  already_held: "Already grasped before the switch",
  gripper: "Gripper failure",
  collision: "Collision",
  stuck: "Stuck",
  timeout: "Timeout",
  missing: "Missing target",
  wrong_goal: "Wrong goal executed",
  controller: "Controller error",
  other: "Other failure",
};

window.STIR_CONFIGS = [
  { key: "fixed", label: "π<sub>fixed</sub> + direct", short: "Fixed-init, direct" },
  { key: "grid", label: "π<sub>grid</sub> + direct", short: "Grid-based, direct" },
  { key: "stir", label: "π<sub>grid</sub> + STIR", short: "Grid-based, steerability-informed replanning" },
];

// Task names are filled in from TASKS below; edit here if the pairing changes.
window.STIR_TASKS = {
  1: { object: "Tape", place: "Tabletop" },
  2: { object: "Scissors", place: "Tabletop" },
  3: { object: "Scissors", place: "Drawer" },
  4: { object: "Tape", place: "Drawer" },
};

var X = function (f, n, s) { return { f: f, n: n, s: s }; };

window.STIR_REAL2 = [
  // ----- No switch -----
  {
    id: "task-1", kind: "fixed", from: 1,
    fixed: [130, 150, 120, 140, 120, 150, 130],
    grid: [120, 140, 110, 170, 110, 120, 120],
  },
  {
    id: "task-2", kind: "fixed", from: 2,
    fixed: [160, 180, 190, 180, 130, 140, X("other", "X")],
    grid: [140, 150, 160, 140, 130, 140, 130],
  },
  {
    id: "task-3", kind: "fixed", from: 3,
    fixed: [310, 260, 250, 250, 290, 310, 250],
    grid: [260, 250, 250, 250, 250, 290, 270],
  },
  {
    id: "task-4", kind: "fixed", from: 4,
    fixed: [360, 330, 370, 380, X("grasp", "Failure - first grasp"), 420, X("stuck", "Stuck")],
    grid: [330, 340, 350, 370, 440, 380, 350],
  },

  // ----- Goal switches -----
  {
    id: "switch-1-3", kind: "switch", from: 1, to: 3,
    fixed: [X("old_goal", "OC, but to goal"), 390, X("old_goal", "OC, but to goal"), X("old_goal", "OC, but to goal"), X("old_goal", "OC, fail to move right place"), 370, X("old_goal", "OC, but to goal")],
    grid: [320, 280, 320, 300, X("grasp", "grasp → change fail"), 310, 290],
    stir: [320, 300, 310, 330, 350, 330, 310],
  },
  {
    id: "switch-1-4", kind: "switch", from: 1, to: 4,
    fixed: [X("old_goal", "OC"), X("collision", "but, collide", 480), X("old_goal", "OC"), X("old_goal", "OC"), X("timeout", "Timeout"), X("timeout", "Timeout", 830), X("old_goal", "OC, and wrong place")],
    grid: [X("other", "X"), 350, X("other", "X"), 380, 450, X("old_goal", "old-goal commit to other goal - grasp"), 380],
    stir: [420, 460, 410, 390, 390, 420, 470],
  },
  {
    id: "switch-2-3", kind: "switch", from: 2, to: 3,
    fixed: [X("old_goal", "OC"), 310, 270, 340, X("old_goal", "OC"), 320, X("stuck", "Stuck")],
    grid: [290, 290, 290, 290, X("collision", "Collision, switching between progress"), 280, X("stuck", "Stuck")],
    stir: [310, 280, 320, 340, X("old_goal", "OC"), 310, 340],
  },
  {
    id: "switch-2-4", kind: "switch", from: 2, to: 4,
    fixed: [X("old_goal", "OC"), X("old_goal", "OC"), X("stuck", "Stuck"), 370, X("old_goal", "OC"), X("old_goal", "OC, but to goal"), X("other", "Failure")],
    grid: [X("missing", "missing target"), 380, 400, X("other", "Failure"), X("missing", "missing target"), X("collision", "OC → collision"), X("stuck", "Stuck on middle")],
    stir: [410, X("other", "Failure"), 440, 410, X("old_goal", "OC, but change goal"), 430, X("old_goal", "OC, but change goal")],
  },
  {
    id: "switch-3-1", kind: "switch", from: 3, to: 1,
    fixed: [160, 180, 150, 170, 150, 160, 160],
    grid: [280, X("old_goal", "O-C", 360), 210, 170, X("old_goal", "O-C", 290), 140, 160],
    stir: [170, 180, 170, 160, 160, 140, 140],
  },
  {
    id: "switch-3-2", kind: "switch", from: 3, to: 2,
    fixed: [X("gripper", "Gripper"), 230, 220, 190, 180, 190, 210],
    grid: [X("old_goal", "OC - open"), 450, X("grasp", "Failure - grasp"), 180, 190, 180, 200],
    stir: [200, 360, 210, 220, 160, 220, 200],
  },
  {
    id: "switch-4-1", kind: "switch", from: 4, to: 1,
    fixed: [160, X("wrong_goal", "executed 4 → 3"), X("wrong_goal", "executed 4 → 3"), X("wrong_goal", "executed 4 → 3"), 150, 150, 150],
    grid: [150, 180, 140, 160, 140, 140, 140],
    stir: [160, 160, 140, 140, 150, 130, 140],
  },
  {
    id: "switch-4-2", kind: "switch", from: 4, to: 2,
    fixed: [X("gripper", "gripper fail"), X("collision", "Fail, collision"), X("old_goal", "OG"), X("old_goal", "OG"), 230, X("gripper", "gripper fail"), 190],
    grid: [X("controller", "Null-space configuration error"), 450, 190, 220, 190, 150, 170],
    stir: [X("controller", "Null-space configuration error"), 270, 360, 190, 190, 180, 200],
  },
];
