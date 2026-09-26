/* Generated from the compiled native parameter catalogue. */
(function(root){const data=[
  {
    "key": "fx-Spring",
    "latency": 16,
    "params": [
      [
        "Size",
        0,
        100,
        50,
        "%"
      ],
      [
        "Decay",
        0,
        100,
        50,
        "%"
      ],
      [
        "Reflections",
        0,
        100,
        70,
        "%"
      ],
      [
        "Spin",
        0,
        100,
        50,
        "%"
      ],
      [
        "Damping",
        0,
        100,
        50,
        "%"
      ],
      [
        "Chaos",
        0,
        100,
        0,
        "%"
      ],
      [
        "Mix",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Spring Tank",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Surge / ChowDSP",
    "detail": "Reverb · Surge / ChowDSP",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          50,
          50,
          70,
          50,
          50,
          0,
          25
        ]
      },
      {
        "name": "Deep space",
        "values": [
          50,
          67.5,
          70,
          50,
          50,
          0,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-DiffuseDelay",
    "latency": 0,
    "params": [
      [
        "Time",
        20,
        2000,
        380,
        "ms"
      ],
      [
        "Feedback",
        0,
        90,
        35,
        "%"
      ],
      [
        "Diffusion",
        0,
        100,
        45,
        "%"
      ],
      [
        "Width",
        0,
        100,
        35,
        "%"
      ],
      [
        "Mix",
        0,
        100,
        28,
        "%"
      ]
    ],
    "name": "Diffuse Echo",
    "type": "Pedals",
    "category": "Delay",
    "engine": "ChowMatrix diffusion adaptation",
    "detail": "Delay · ChowMatrix diffusion adaptation",
    "icon": "≈",
    "colour": "#69afb5",
    "sync": true,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          380,
          35,
          45,
          35,
          28
        ]
      },
      {
        "name": "Wide repeats",
        "values": [
          380,
          47.25,
          45,
          35,
          44.800000000000004
        ]
      }
    ]
  },
  {
    "key": "fx-SurgeDelay",
    "latency": 16,
    "params": [
      [
        "Left",
        10,
        2000,
        380,
        "ms"
      ],
      [
        "Right",
        10,
        2000,
        380,
        "ms"
      ],
      [
        "Feedback",
        0,
        100,
        25,
        "%"
      ],
      [
        "Crossfeed",
        0,
        100,
        0,
        "%"
      ],
      [
        "Low Cut",
        20,
        18000,
        80,
        "Hz"
      ],
      [
        "High Cut",
        20,
        18000,
        8000,
        "Hz"
      ],
      [
        "Rate",
        0.02,
        12,
        0.5,
        "Hz"
      ],
      [
        "Depth",
        0,
        200,
        40,
        "%"
      ],
      [
        "Channel",
        -100,
        100,
        0,
        "%"
      ],
      [
        "",
        0,
        1,
        0,
        ""
      ],
      [
        "Mix",
        0,
        100,
        30,
        "%"
      ],
      [
        "Width",
        -24,
        24,
        0,
        "dB"
      ]
    ],
    "name": "Stereo Digital",
    "type": "Pedals",
    "category": "Delay",
    "engine": "Surge",
    "detail": "Delay · Surge",
    "icon": "≈",
    "colour": "#69afb5",
    "sync": true,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          380,
          380,
          25,
          0,
          80,
          8000,
          0.5,
          40,
          0,
          0,
          30,
          0
        ]
      },
      {
        "name": "Wide repeats",
        "values": [
          380,
          570,
          33.75,
          35,
          80,
          8000,
          0.5,
          40,
          0,
          0,
          48,
          0
        ]
      }
    ]
  },
  {
    "key": "fx-TapeDelay2",
    "latency": 0,
    "params": [
      [
        "Time",
        0,
        100,
        40,
        "%"
      ],
      [
        "Regen",
        0,
        100,
        30,
        "%"
      ],
      [
        "Freq",
        0,
        100,
        50,
        "%"
      ],
      [
        "Reso",
        0,
        100,
        0,
        "%"
      ],
      [
        "Flutter",
        0,
        100,
        12,
        "%"
      ],
      [
        "Dry/Wet",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Tape Machine",
    "type": "Pedals",
    "category": "Delay",
    "engine": "Airwindows",
    "detail": "Delay · Airwindows",
    "icon": "≈",
    "colour": "#69afb5",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          40,
          30,
          50,
          0,
          12,
          25
        ]
      },
      {
        "name": "Wide repeats",
        "values": [
          40,
          40.5,
          50,
          0,
          12,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-Doublelay",
    "latency": 0,
    "params": [
      [
        "Detune",
        0,
        100,
        20,
        "%"
      ],
      [
        "Delay L",
        0,
        100,
        20,
        "%"
      ],
      [
        "Delay R",
        0,
        100,
        30,
        "%"
      ],
      [
        "Feedbk",
        0,
        100,
        25,
        "%"
      ],
      [
        "Dry/Wet",
        0,
        100,
        30,
        "%"
      ]
    ],
    "name": "Double Echo",
    "type": "Pedals",
    "category": "Delay",
    "engine": "Airwindows",
    "detail": "Delay · Airwindows",
    "icon": "≈",
    "colour": "#69afb5",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          20,
          20,
          30,
          25,
          30
        ]
      },
      {
        "name": "Wide repeats",
        "values": [
          20,
          20,
          30,
          25,
          48
        ]
      }
    ]
  },
  {
    "key": "fx-PitchDelay",
    "latency": 0,
    "params": [
      [
        "Time",
        0,
        100,
        40,
        "%"
      ],
      [
        "Regen",
        0,
        100,
        25,
        "%"
      ],
      [
        "Freq",
        0,
        100,
        50,
        "%"
      ],
      [
        "Reso",
        0,
        100,
        0,
        "%"
      ],
      [
        "Pitch",
        0,
        100,
        58,
        "%"
      ],
      [
        "Dry/Wet",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Pitch Echo",
    "type": "Pedals",
    "category": "Delay",
    "engine": "Airwindows",
    "detail": "Delay · Airwindows",
    "icon": "≈",
    "colour": "#69afb5",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          40,
          25,
          50,
          0,
          58,
          25
        ]
      },
      {
        "name": "Wide repeats",
        "values": [
          40,
          33.75,
          50,
          0,
          58,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-PurestEcho",
    "latency": 0,
    "params": [
      [
        "Time",
        0,
        100,
        35,
        "%"
      ],
      [
        "Tap 1",
        0,
        100,
        30,
        "%"
      ],
      [
        "Tap 2",
        0,
        100,
        20,
        "%"
      ],
      [
        "Tap 3",
        0,
        100,
        12,
        "%"
      ],
      [
        "Tap 4",
        0,
        100,
        8,
        "%"
      ]
    ],
    "name": "Four Tap",
    "type": "Pedals",
    "category": "Delay",
    "engine": "Airwindows",
    "detail": "Delay · Airwindows",
    "icon": "≈",
    "colour": "#69afb5",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          35,
          30,
          20,
          12,
          8
        ]
      },
      {
        "name": "Wide repeats",
        "values": [
          52.5,
          30,
          20,
          12,
          8
        ]
      }
    ]
  },
  {
    "key": "fx-DragonHall",
    "latency": 0,
    "params": [
      [
        "Decay",
        0.2,
        10,
        2.5,
        "s"
      ],
      [
        "Width",
        50,
        150,
        100,
        "%"
      ],
      [
        "High cut",
        1000,
        16000,
        8000,
        "Hz"
      ],
      [
        "Mix",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Dragon Hall",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Dragonfly",
    "detail": "Reverb · Dragonfly",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          2.5,
          100,
          8000,
          25
        ]
      },
      {
        "name": "Deep space",
        "values": [
          3.375,
          100,
          8000,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-DragonRoom",
    "latency": 0,
    "params": [
      [
        "Decay",
        0.2,
        10,
        2.5,
        "s"
      ],
      [
        "Width",
        50,
        150,
        100,
        "%"
      ],
      [
        "High cut",
        1000,
        16000,
        8000,
        "Hz"
      ],
      [
        "Mix",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Dragon Room",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Dragonfly",
    "detail": "Reverb · Dragonfly",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          2.5,
          100,
          8000,
          25
        ]
      },
      {
        "name": "Deep space",
        "values": [
          3.375,
          100,
          8000,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-DragonPlate",
    "latency": 0,
    "params": [
      [
        "Decay",
        0.2,
        10,
        2.5,
        "s"
      ],
      [
        "Width",
        50,
        150,
        100,
        "%"
      ],
      [
        "High cut",
        1000,
        16000,
        8000,
        "Hz"
      ],
      [
        "Mix",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Dragon Plate",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Dragonfly",
    "detail": "Reverb · Dragonfly",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          2.5,
          100,
          8000,
          25
        ]
      },
      {
        "name": "Deep space",
        "values": [
          3.375,
          100,
          8000,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-Galactic3",
    "latency": 0,
    "params": [
      [
        "Replace",
        0,
        100,
        50,
        "%"
      ],
      [
        "Brightns",
        0,
        100,
        50,
        "%"
      ],
      [
        "Detune",
        0,
        100,
        35,
        "%"
      ],
      [
        "Derez",
        0,
        100,
        100,
        "%"
      ],
      [
        "Bigness",
        0,
        100,
        80,
        "%"
      ],
      [
        "Dry/Wet",
        0,
        100,
        30,
        "%"
      ]
    ],
    "name": "Galactic",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Airwindows",
    "detail": "Reverb · Airwindows",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          50,
          50,
          35,
          100,
          80,
          30
        ]
      },
      {
        "name": "Deep space",
        "values": [
          50,
          50,
          35,
          100,
          80,
          48
        ]
      }
    ]
  },
  {
    "key": "fx-CreamCoat",
    "latency": 0,
    "params": [
      [
        "Select",
        0,
        100,
        50,
        "%"
      ],
      [
        "Regen",
        0,
        100,
        50,
        "%"
      ],
      [
        "DeRez",
        0,
        100,
        100,
        "%"
      ],
      [
        "Predlay",
        0,
        100,
        0,
        "%"
      ],
      [
        "Wetness",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Cream Plate",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Airwindows",
    "detail": "Reverb · Airwindows",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          50,
          50,
          100,
          0,
          25
        ]
      },
      {
        "name": "Deep space",
        "values": [
          50,
          67.5,
          100,
          0,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-kCathedral5",
    "latency": 0,
    "params": [
      [
        "Regen",
        0,
        100,
        50,
        "%"
      ],
      [
        "Derez",
        0,
        100,
        60,
        "%"
      ],
      [
        "Filter",
        0,
        100,
        24,
        "%"
      ],
      [
        "EarlyRF",
        0,
        100,
        50,
        "%"
      ],
      [
        "Positin",
        0,
        100,
        50,
        "%"
      ],
      [
        "Dry/Wet",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Cathedral",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Airwindows",
    "detail": "Reverb · Airwindows",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          50,
          60,
          24,
          50,
          50,
          25
        ]
      },
      {
        "name": "Deep space",
        "values": [
          67.5,
          60,
          24,
          50,
          50,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-kGuitarHall2",
    "latency": 0,
    "params": [
      [
        "Regen",
        0,
        100,
        45,
        "%"
      ],
      [
        "Derez",
        0,
        100,
        60,
        "%"
      ],
      [
        "Filter",
        0,
        100,
        50,
        "%"
      ],
      [
        "EarlyRF",
        0,
        100,
        50,
        "%"
      ],
      [
        "Positin",
        0,
        100,
        50,
        "%"
      ],
      [
        "Dry/Wet",
        0,
        100,
        25,
        "%"
      ]
    ],
    "name": "Guitar Hall",
    "type": "Pedals",
    "category": "Reverb",
    "engine": "Airwindows",
    "detail": "Reverb · Airwindows",
    "icon": "✧",
    "colour": "#b597cb",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          45,
          60,
          50,
          50,
          50,
          25
        ]
      },
      {
        "name": "Deep space",
        "values": [
          60.75000000000001,
          60,
          50,
          50,
          50,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-StereoChorus",
    "latency": 0,
    "params": [
      [
        "Speed",
        0,
        100,
        30,
        "%"
      ],
      [
        "Depth",
        0,
        100,
        40,
        "%"
      ]
    ],
    "name": "Stereo Chorus",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Airwindows",
    "detail": "Modulation · Airwindows",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          30,
          40
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          45,
          40
        ]
      }
    ]
  },
  {
    "key": "fx-StereoEnsemble",
    "latency": 0,
    "params": [
      [
        "Depth",
        0,
        100,
        45,
        "%"
      ],
      [
        "FXlevel",
        0,
        100,
        55,
        "%"
      ]
    ],
    "name": "Ensemble",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Airwindows",
    "detail": "Modulation · Airwindows",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          45,
          55
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          67.5,
          55
        ]
      }
    ]
  },
  {
    "key": "fx-SurgeFlanger",
    "latency": 16,
    "params": [
      [
        "Mode",
        0,
        3,
        0,
        ""
      ],
      [
        "Waveform",
        0,
        5,
        0,
        ""
      ],
      [
        "Rate",
        0.02,
        12,
        0.5,
        "Hz"
      ],
      [
        "Depth",
        0,
        100,
        40,
        "%"
      ],
      [
        "Count",
        1,
        4,
        4,
        ""
      ],
      [
        "Base Pitch",
        0,
        127,
        60,
        ""
      ],
      [
        "Spacing",
        0,
        12,
        0,
        ""
      ],
      [
        "Feedback",
        0,
        100,
        25,
        "%"
      ],
      [
        "HF Damping",
        0,
        100,
        10,
        "%"
      ],
      [
        "Width",
        -24,
        24,
        0,
        "dB"
      ],
      [
        "Mix",
        -100,
        100,
        30,
        "%"
      ]
    ],
    "name": "Jet Flanger",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Surge",
    "detail": "Modulation · Surge",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          0,
          0,
          0.5,
          40,
          4,
          60,
          0,
          25,
          10,
          0,
          30
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          0,
          0,
          0.5,
          40,
          4,
          60,
          0,
          33.75,
          10,
          0,
          48
        ]
      }
    ]
  },
  {
    "key": "fx-SurgePhaser",
    "latency": 16,
    "params": [
      [
        "Center",
        -100,
        100,
        0,
        "%"
      ],
      [
        "Feedback",
        -100,
        100,
        0,
        "%"
      ],
      [
        "Sharpness",
        -100,
        100,
        0,
        "%"
      ],
      [
        "Rate",
        0.02,
        12,
        0.5,
        "Hz"
      ],
      [
        "Depth",
        0,
        100,
        40,
        "%"
      ],
      [
        "Stereo",
        0,
        100,
        40,
        "%"
      ],
      [
        "Mix",
        0,
        100,
        30,
        "%"
      ],
      [
        "Width",
        -24,
        24,
        0,
        "dB"
      ],
      [
        "Count",
        1,
        16,
        4,
        ""
      ],
      [
        "Spread",
        0,
        100,
        0,
        "%"
      ],
      [
        "Waveform",
        0,
        6,
        0,
        ""
      ],
      [
        "Tone",
        -100,
        100,
        0,
        "%"
      ]
    ],
    "name": "Phase Sweep",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Surge",
    "detail": "Modulation · Surge",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          0,
          0,
          0,
          0.5,
          40,
          40,
          30,
          0,
          4,
          0,
          0,
          0
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          0,
          0,
          0,
          0.5,
          40,
          40,
          48,
          0,
          4,
          0,
          0,
          0
        ]
      }
    ]
  },
  {
    "key": "fx-SurgeRotary",
    "latency": 16,
    "params": [
      [
        "Horn Rate",
        0.02,
        12,
        0.5,
        "Hz"
      ],
      [
        "Doppler",
        0,
        100,
        40,
        "%"
      ],
      [
        "Tremolo",
        0,
        100,
        40,
        "%"
      ],
      [
        "Rotor Rate",
        0,
        2,
        0.7,
        ""
      ],
      [
        "Drive",
        0,
        100,
        0,
        "%"
      ],
      [
        "Model",
        0,
        7,
        0,
        ""
      ],
      [
        "Width",
        -24,
        24,
        0,
        "dB"
      ],
      [
        "Mix",
        0,
        100,
        30,
        "%"
      ]
    ],
    "name": "Rotary Speaker",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Surge",
    "detail": "Modulation · Surge",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          0.5,
          40,
          40,
          0.7,
          0,
          0,
          0,
          30
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          0.5,
          40,
          40,
          0.7,
          0,
          0,
          0,
          48
        ]
      }
    ]
  },
  {
    "key": "fx-Vibrato",
    "latency": 0,
    "params": [
      [
        "Speed",
        0,
        100,
        30,
        "%"
      ],
      [
        "Depth",
        0,
        100,
        25,
        "%"
      ],
      [
        "FMSpeed",
        0,
        100,
        40,
        "%"
      ],
      [
        "FMDepth",
        0,
        100,
        0,
        "%"
      ],
      [
        "Inv/Wet",
        0,
        100,
        100,
        "%"
      ]
    ],
    "name": "Pitch Vibrato",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Airwindows",
    "detail": "Modulation · Airwindows",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          30,
          25,
          40,
          0,
          100
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          30,
          25,
          40,
          0,
          100
        ]
      }
    ]
  },
  {
    "key": "fx-Tremolo",
    "latency": 0,
    "params": [
      [
        "Speed",
        0,
        100,
        45,
        "%"
      ],
      [
        "Depth",
        0,
        100,
        50,
        "%"
      ]
    ],
    "name": "Tremolo",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Airwindows",
    "detail": "Modulation · Airwindows",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          45,
          50
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          67.5,
          50
        ]
      }
    ]
  },
  {
    "key": "fx-AutoPan",
    "latency": 0,
    "params": [
      [
        "Rate",
        0,
        100,
        25,
        "%"
      ],
      [
        "Phase",
        0,
        100,
        50,
        "%"
      ],
      [
        "Wide",
        0,
        100,
        60,
        "%"
      ],
      [
        "Dry/Wet",
        0,
        100,
        70,
        "%"
      ]
    ],
    "name": "Auto Pan",
    "type": "Pedals",
    "category": "Modulation",
    "engine": "Airwindows",
    "detail": "Modulation · Airwindows",
    "icon": "∿",
    "colour": "#83b99b",
    "sync": false,
    "presets": [
      {
        "name": "Balanced",
        "values": [
          25,
          50,
          60,
          70
        ]
      },
      {
        "name": "Deep movement",
        "values": [
          25,
          50,
          60,
          100
        ]
      }
    ]
  }
];if(typeof module==='object'&&module.exports)module.exports=data;else root.EffectsCatalogue=data;})(globalThis);
