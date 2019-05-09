var levels = [
  {
    num: 1,
    label: 'Level 1',
    description: 'Lorem Ipsum',
    mapImage: 'level1.png',
    bgm: 'music-1.mp3',
    gameOver: [
      {
        type: 'balanceAbove',
        value: 10000,
        stageNum: 2
      }
    ],
    params: {
      hospital: {
        startingBalance: 2500,
        revenueDelay: 25000,
        startingOrgans: 1
      },
      doctor: {
        startingPos: [11, 12.8]
      },
      treatments: {
        // todo
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
      label: 'level 2',
      description: 'Lorem Ipsum',
      mapImage: 'level2.png',
      bgm: 'music-2.mp3',
      gameOver: [
        {
          type: 'curedPatientsCountEquals',
          value: 1,
          stageNum: 2
        },
        {
          type: 'deathCountEquals',
          value: 2,
          stageNum: 1
        }
      ],
      params: {
        hospital: {
          startingBalance: 2500,
          revenueDelay: 25000,
          startingOrgans: 1
        },
        doctor: {
          startingPos: [11, 12.8]
        },
        treatments: {
          // todo
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
          enabled: false,
        },
        police: {
          enabled: false,
        },
        facilityManager: {
          enabled: false
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
]