// Real-1 (3-cube pick-and-place) per-trial results, from Goal_switching_experiment.xlsx.
// Numbers are control steps; 1 step = 0.1 s. A bare number is a success;
// an object is a failure {f: code, n: note, s: steps if recorded}.
// Columns are the seven start positions.
window.STIR_REAL1 = {
 "switch": [
  {
   "id": "r1-switch-R-B",
   "from": "R",
   "to": "B",
   "fixed": [
    {
     "f": "old_goal",
     "n": "Continued to the red cube, the old goal.",
     "s": null
    },
    {
     "f": "other",
     "n": "Reached the goal, but only after 21.0 s — outside the time criterion.",
     "s": 210
    },
    130,
    {
     "f": "old_goal",
     "n": "Continued to the red cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the red cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the red cube, the old goal.",
     "s": null
    },
    140
   ],
   "grid": [
    150,
    150,
    140,
    130,
    140,
    140,
    140
   ],
   "stir": [
    160,
    160,
    140,
    140,
    150,
    150,
    150
   ]
  },
  {
   "id": "r1-switch-B-K",
   "from": "B",
   "to": "K",
   "fixed": [
    {
     "f": "old_goal",
     "n": "Continued to the blue cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the blue cube, the old goal.",
     "s": null
    },
    140,
    {
     "f": "old_goal",
     "n": "Continued to the blue cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the blue cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the blue cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the blue cube, the old goal.",
     "s": null
    }
   ],
   "grid": [
    130,
    120,
    120,
    130,
    {
     "f": "old_goal",
     "n": "Continued to the blue cube, the old goal.",
     "s": null
    },
    140,
    150
   ],
   "stir": [
    130,
    120,
    120,
    130,
    {
     "f": "already_held",
     "n": "Already holding the previous cube when the command changed.",
     "s": null
    },
    150,
    160
   ]
  },
  {
   "id": "r1-switch-K-R",
   "from": "K",
   "to": "R",
   "fixed": [
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    140,
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    }
   ],
   "grid": [
    170,
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    },
    170,
    170,
    {
     "f": "old_goal",
     "n": "Continued to the black cube, the old goal.",
     "s": null
    }
   ],
   "stir": [
    180,
    180,
    {
     "f": "already_held",
     "n": "Already holding the previous cube when the command changed.",
     "s": null
    },
    180,
    180,
    180,
    190
   ]
  }
 ],
 "noswitch": [
  {
   "id": "r1-task-R",
   "goal": "R",
   "fixed": [
    170,
    140,
    150,
    180,
    140,
    120,
    150
   ],
   "grid": [
    150,
    150,
    160,
    150,
    140,
    140,
    150
   ]
  },
  {
   "id": "r1-task-K",
   "goal": "K",
   "fixed": [
    110,
    120,
    160,
    110,
    90,
    100,
    130
   ],
   "grid": [
    120,
    130,
    140,
    120,
    120,
    130,
    130
   ]
  },
  {
   "id": "r1-task-B",
   "goal": "B",
   "fixed": [
    90,
    150,
    90,
    110,
    100,
    100,
    90
   ],
   "grid": [
    100,
    100,
    80,
    90,
    120,
    110,
    110
   ]
  }
 ],
 "marks": [
  {
   "case": "r1-switch-K-R",
   "trial": 3,
   "note": "Shown in the video."
  },
  {
   "case": "r1-switch-K-R",
   "trial": 4,
   "note": "Shown in the video."
  }
 ]
};
