
const defaultHints = [
  new Hint('Diagnosis is optional, but recommended\nif saving patients is your goal', 1),
  new Hint('Occupied beds yield recurring rent', 1),
  new Hint('If you ignore patients at your counter for\ntoo long, they will leave', 2),
  new Hint('Patients can (and sometimes should) be treated\nmultiple times', 2),
  new Hint('Different patients pay different amounts for treatments', 2),
  new Hint('Suits are a sign of wealth', 3),
  new Hint('Wealthy patients pay higher bed rent', 3),
  new Hint('Health bars not only show current health,\nbut also state of regeneration', 3)
];

const defaultSettings = {
  params: {
    treatments: {
      diagnose: {
        baseDuration: 1000,
        multiplicatorRange: [7, 40]
      },
      drugs: {
        isTreatment: true,
        name: 'Prescribe Drugs',
        sleepTime: 5,
        costsForPatient: 100,
        costsForHospital: 10,
        failureRegenerative: 0.0,
        failureAbsolute: 0.0,
        riskOfDeath: 0.01,
        enabledCallback: undefined,
        iconIndex: 0
      },
      surgery: {
        isTreatment: true,
        name: 'Surgery',
        sleepTime: 20,
        costsForPatient: 1000,
        costsForHospital: 500,
        failureRegenerative: -0.1,
        failureAbsolute: -0.3,
        riskOfDeath: 0.1,
        enabledCallback: undefined,
        iconIndex: 9
      },
      placeboSurgery: {
        isTreatment: true,
        name: 'Placebo Surgery',
        sleepTime: 10,
        costsForPatient: 1000,
        costsForHospital: 80,
        failureRegenerative: 0.0,
        failureAbsolute: 0.0,
        riskOfDeath: 0,
        enabledCallback: undefined,
        iconIndex: 1
      },
      organ: {
        isTreatment: true,
        name: 'Give Organ',
        sleepTime: 30,
        costsForPatient: 5000,
        costsForHospital: 1000,
        failureRegenerative: -0.1,
        failureAbsolute: -0.3,
        riskOfDeath: 0.12,
        enabledCallback: () => gameStage.gameState.hospital.organs > 0,
        iconIndex: 2
      },
      antibiotics: {
        isTreatment: true,
        name: 'Give Antibiotics',
        sleepTime: 5,
        costsForPatient: 200,
        costsForHospital: 40,
        failureRegenerative: -0.1,
        failureAbsolute: -0.1,
        riskOfDeath: 0,
        enabledCallback: undefined,
        iconIndex: 3
      },
      takeOrgan: {
        isTreatment: true,
        name: 'Take Organ',
        sleepTime: 30,
        costsForPatient: 2000,
        costsForHospital: 500,
        failureRegenerative: -0.2,
        failureAbsolute: -0.4,
        riskOfDeath: 0.2,
        enabledCallback: (p) => p.hasOrgan,
        iconIndex: 4
      },
      fixLeg: {
        isTreatment: true,
        name: 'Fix Fracture',
        sleepTime: 20,
        costsForPatient: 800,
        costsForHospital: 220,
        failureRegenerative: -0.1,
        failureAbsolute: -0.3,
        riskOfDeath: 0.03,
        enabledCallback: undefined,
        iconIndex: 5
      }
    }
  }
};

const levelOverrides = [
  {
    num: 1,
    mapImage: 'level1.png',
    bgm: 'music-1.mp3',
    thumb: 'thumb_level1.png',
    instruction: 'modal_intro_level1.png',
    gameOver: {
      balanceAbove: {
        value: 15000,
        endingKey: 'beach',
        text: 'Make 15.0000 $'
      }
    },
    hints: [
      new Hint('In case a patient dies, the facility manager (gray suit)\nwill get rid of the evidence', 0),
      new Hint('It is sometimes wise to not accept all patients', 1),
      new Hint('The mafia takes increasing amounts of money\nevery time they visit', 2),
      new Hint('When the police witnesses the facility manager\ndisposing of a body, you pay a fine', 2),
      new Hint('You can only bribe the police twice,\nthe third time there will be no escape', 2)
    ].concat(defaultHints),
    params: {
      hospital: {
        startingBalance: 2500,
        revenueDelay: 25000,
        startingOrgans: 1
      },
      doctor: {
        startingPos: [11, 12.8]
      },
      balance: {
        curedPatient: 500,
        acceptPatient: -20,
        sendAwayPatient: 40,
        bedRent: 50,
        richBedRent: 150,
        deadPatient: 250
      },
      patients: {
        firstSpawnTime: 3000,
        spawnTimeFactor: 1,
        spawnTimeFactorReduction: 1.04,
        spawnIntervalRange: [13000, 23000],
        maxSpawnIntervalRange: [4000, 8000],
        healthRange: [35, 100],
        patientsWithFullHealth: 4,
        wealthRange: [15, 100],
        healthDecrease: 1.5,
        patienceRange: [60000, 120000]
      },
      mafia: {
        enabled: true,
        startingDanegeld: 1000,
        additionalDanegeld: 400,
        firstSpawnTime: 100000,
        spawnIntervalRange: [20000, 40000]
      },
      police: {
        enabled: true,
        firstSpawnTime: 75000,
        briberyAmount: 1000,
        spawnIntervalRange: [20000, 40000]
      },
      facilityManager: {
        enabled: true
      }
    },
    rawMap: 'c-sw--------------w-----\n'
          + '---w--------------w-----\n'
          + '---w--------------w-----\n'
          + '---wwwwwww--wwwwwww-----\n'
          + '---wwb-b-w--w-b-bww-----\n'
          + '---w-b-b-wwww-b-b-w-Fww-\n'
          + '---w--------------wwwww-\n'
          + '---wwwwwww--wwwwwww-p---\n'
          + '---wwb-b-w--w-b-bww-----\n'
          + '---w-b-b-w--w-b-b-w-----\n'
          + '---w--------------ww-www\n'
          + '---wwww-ww--ww-wwww-----\n'
          + '---w--w-w----w-w--w-----\n'
          + '---w--w-wwwwww-wf-w-----\n'
          + '---w--w--rrrr-----w-----\n'
          + '---wwwww------wwwww-----\n'
          + '-------www--www---------\n'
          + '-------www--www---------\n'
          + '-----------------------s\n'
          + '------------------------\n'
          + 'C-------N-M-------Q-P---'
  },
  {
      num: 2,
      mapImage: 'level2.png',
      bgm: 'music-2.mp3',
      thumb: 'thumb_level2.png',
      instruction: 'modal_intro_level2.png',
      gameOver: {
        curedPatientsCountEquals: {
          value: 10,
          endingKey: 'goodDoctor',
          text: 'Cure 10 Patients'
        },
        deathCountEquals: {
          value: 2,
          endingKey: 'badDoctor',
          text: 'No more than 2 deaths'
        },
        patientsRejectedEquals: {
          value: 5,
          endingKey: 'badDoctor',
          text: 'No more than 5 rejections'
        }
      },
      hints: [
        new Hint('Dead patients will not be disposed in this hospital.\nA single dead patient greatly reduces your odds\nof success!', 1),
        new Hint('Surgeries can kill patients even if they\'re successful.\nMaybe try drugs or placebo surgeries instead to\nreduce the risk.', 1),
        new Hint('Drugs help against most problems,\nremember this when there\'s no time for a diagnosis', 2)
      ].concat(defaultHints),
      params: {
        hospital: {
          startingBalance: 2500,
          revenueDelay: 25000,
          startingOrgans: 2
        },
        doctor: {
          startingPos: [7, 8.8]
        },
        treatments: {
          diagnose: {
            baseDuration: 500,
            multiplicatorRange: [4, 8]
          },
          drugs: {
            sleepTime: 8,
            riskOfDeath: 0
          },
          placeboSurgery: {
            sleepTime: 10,
            riskOfDeath: 0
          },
          organ: {
            sleepTime: 15,
            riskOfDeath: 0
          },
          antibiotics: {
            sleepTime: 8,
            riskOfDeath: 0
          },
          takeOrgan: {
            sleepTime: 15,
            riskOfDeath: 0
          },
          fixLeg: {
            sleepTime: 10,
            riskOfDeath: 0
          }
        },
        balance: {
          curedPatient: 500,
          acceptPatient: -20,
          sendAwayPatient: 40,
          bedRent: 50,
          richBedRent: 150,
          deadPatient: 250
        },
        patients: {
          firstSpawnTime: 3000,
          spawnTimeFactor: 1,
          spawnTimeFactorReduction: 1.04,
          spawnIntervalRange: [15000, 25000],
          maxSpawnIntervalRange: [10000, 15000],
          healthRange: [45, 85],
          patientsWithFullHealth: 1,
          wealthRange: [15, 100],
          healthDecrease: 1.5,
          patienceRange: [60000, 120000]
        },
        mafia: {
          enabled: false,
        },
        police: {
          enabled: false,
        },
        facilityManager: {
          enabled: false
        }
      },
      rawMap: '------------wwwwwww----\n'
            + '------------wwwwwww----\n'
            + '------------wwwwwww----\n'
            + '-----wwwwwwwwwwwwww----\n'
            + '-----w------w-w-b-w----\n'
            + '-----w------w---b-w----\n'
            + '-----wwwwwwww-w---w----\n'
            + '-----w------w-wwwww----\n'
            + '-----w--------w-b-w----\n'
            + '-----wwwww------b-w----\n'
            + '-----wrrrr--w-w---w----\n'
            + '-----ww--wwwwwwwww-----\n'
            + '-----ww--wwwwwwwww-----\n'
            + '-----ww--wwwwwwwww-----\n'
            + '------w--w-------------\n'
            + '------w--w-------------\n'
            + '------w--w-------------\n'
            + '------w--w-------------\n'
            + 'wwwwwwwsswwwwwwwwwwwwww'
    },
]

var levels = levelOverrides.map(levelOverride => deepmerge(defaultSettings, levelOverride));