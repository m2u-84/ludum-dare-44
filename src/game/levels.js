var levels = [
  {
    num: 1,
    mapImage: 'level1.png',
    bgm: 'music-1.mp3',
    instruction: 'modal_intro_level1.png',
    gameOver: {
      balanceAbove: {
        value: 15000,
        stageNum: 2
      }
    },
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
        diagnose: {
          baseDuration: 1000,
          multiplicatorRange: [7, 40]
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
      instruction: 'modal_intro_level2.png',
      gameOver: {
        curedPatientsCountEquals: {
          value: 15,
          stageNum: 2
        },
        deathCountEquals: {
          value: 2,
          stageNum: 1
        },
        patientsRejectedEquals: {
          value: 5,
          stageNum: 1
        }
      },
      params: {
        hospital: {
          startingBalance: 2500,
          revenueDelay: 25000,
          startingOrgans: 1
        },
        doctor: {
          startingPos: [7, 8.8]
        },
        treatments: {
          diagnose: {
            baseDuration: 1000,
            multiplicatorRange: [5, 10]
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
          maxSpawnIntervalRange: [5000, 9000],
          healthRange: [35, 85],
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