function GameState(currentLevel) {
    this.currentLevel = currentLevel;
    this.startTime = gameStage.time;

    this.level = new Level(this.currentLevel.rawMap);
    this.hospital = new Hospital(this);

    this.doctor = new Doctor(this.currentLevel.params.doctor.startingPos[0], this.currentLevel.params.doctor.startingPos[1], 0.5, 0.1, this);

    this.cars = [];
    this.facilityManager = null;
    this.closestPatientToDoctor = null;
    this.policyBriberyAttempts = 0;
    this.lastBriberyAttempt = -99999;
    this.danegeld = this.currentLevel.params.mafia.startingDanegeld;
    this.gameOver = false;
    this.stats = {
        totalSeconds: 0,
        playTime: '0:00',
        patientCount: 0,
        patientsAccepted: 0,
        patientsRejected: 0,
        patientsDied: 0,
        moneyEarned: 0,
        patientsCured: 0,
        treatments: 0,
        diagnoses: 0,
        pingPongBounces: 0,
        treatmentsFailed: 0,
        treatmentsSucceeded: 0
    }

    this.releaseTreatment = new Treatment('Release as cured',      0,    0,  0.0,  0.0, 6);
    // possible treatments

    const levelTreatments = this.currentLevel.params.treatments;

    // this.treatments = {
    //     //                            name        sleepTime[s]   price pat|hosp  failure, risk of death, iconIndex
    //     drugs:          new Treatment('Prescribe Drugs',     5,      100,   10,  0.0,  0.0, params.drugs.riskOfDeath, undefined, 0),
    //     placeboSurgery: new Treatment('Placebo Surgery',    10,     1000,   80,  0.0,  0.0, params.placeboSurgery.riskOfDeath, undefined, 1),
    //     // surgery:        new Treatment('Proper Surgery',     20,     1000,  500, -0.1, -0.3, 0.1),
    //     organ:          new Treatment('Give Organ',         30,     5000, 1000, -0.1, -0.3, params.organ.riskOfDeath, () => this.hospital.organs > 0, 2),
    //     antibiotics:    new Treatment('Give Antibiotics',    5,      200,   40, -0.1, -0.1, params.antibiotics.riskOfDeath, undefined, 3),
    //     takeOrgan:      new Treatment('Take Organ',         30,     2000,  500, -0.2, -0.4, params.takeOrgan.riskOfDeath, (p) => p.hasOrgan, 4),
    //     fixLeg:         new Treatment('Fix Fracture',       20,      800,  220, -0.1, -0.3, params.fixLeg.riskOfDeath, undefined, 5)
    // };
    console.log(levelTreatments);

    this.treatments = {};
    Object.keys(levelTreatments).forEach(t => {
        console.log(levelTreatments[t])
        if (levelTreatments[t].enabled) {
            this.treatments[t] = new Treatment(
                levelTreatments[t].name,
                levelTreatments[t].sleepTime,
                levelTreatments[t].costsForPatient,
                levelTreatments[t].costsForHospital,
                levelTreatments[t].failureRegenerative,
                levelTreatments[t].failureAbsolute,
                levelTreatments[t].riskOfDeath,
                levelTreatments[t].enabledCallback,
                levelTreatments[t].iconIndex);
        }
    });
    console.log(this.treatments);
    this.treatmentArray = Object.keys(this.treatments).map(key => this.treatments[key]);

    console.log(this.treatmentArray);
    this.receptions = [
        new Treatment("Admit Patient", 0, 0, this.currentLevel.params.balance.acceptPatient, 0, 0, 0, () => !this.allBedsOccupied(), 6),
        new Treatment("Send Away", 0, 0, this.currentLevel.params.balance.sendAwayPatient, 0, 0, 0, undefined, 7)
    ];
    this.acceptReception = this.receptions[0];
    this.rejectReception = this.receptions[1];
    // common sicknesses
    var self = this;
    this.sicknesses = [
        new Sickness(0.0, 'Hypochondria', this.treatments.placeboSurgery),
        new Sickness(0.1, 'Common Cold', this.treatments.placeboSurgery),
        new Sickness(0.2, 'Demonic Possession', this.treatments.takeOrgan),
        new Sickness(0.2, 'Depression', this.treatments.drugs),
        new Sickness(0.2, 'Bone Fracture', this.treatments.fixLeg),
        new Sickness(0.3, 'Influenza', this.treatments.drugs),
        new Sickness(0.2, 'Diarrhea', this.treatments.antibiotics),
        // new Sickness(0.6, 'Stroke', this.treatments.surgery),
        new Sickness(0.8, 'Anthrax', this.treatments.antibiotics),
        new Sickness(0.8, 'Kidney Failure', this.treatments.organ),
        new Sickness(0.8, 'Appendicitis', this.treatments.surgery)
    ];
    // Relations between sickness & treatment     Hyp  CCl  Dem  Dep  Frc  Flu  Drh    Stk  Ant  Kid   App
    setRelations(this.treatments.drugs,          [0.5, 0.4, 0.1, 0.6, 0.1, 0.8, 0.2/* 0.1*/, 0.3, 0.1, 0.1]);
    setRelations(this.treatments.placeboSurgery, [1.0, 0.5, 0.3, 0.2, 0.0, 0.0,-0.3/* 0.0*/, 0.0,-0.1, 0.0]);
    setRelations(this.treatments.organ,          [0.6,-0.3,-0.2,-0.3,-0.2,-0.5, 0.1/*-0.2*/, 0.2, 0.6, 0.2]);
    setRelations(this.treatments.antibiotics,    [0.3, 0.1,-0.1, 0.0, 0.0, 0.3, 0.7/* 0.0*/, 0.5,-0.1, 0.1]);
    setRelations(this.treatments.takeOrgan,      [0.1,-1.0, 1.0,-0.4,-1.0,-1.0,-0.6/*-1.0*/,-1.0, 0.0,-0.5]);
    setRelations(this.treatments.fixLeg,         [0.2,-0.3, 0.0,-0.2, 1.0,-0.4,-0.5/*-0.3*/,-0.4,-0.5,-0.4]);
    setRelations(this.treatments.surgery,        [0.5,-0.5, 0.2,-0.6,-0.3,-0.8, 0.2/*-0.4*/,-0.3, 0.2, 1.0]);

    // start with 0 patients
    this.patients = [];

    function setRelations(treatment, values) {
        for (var i = 0; i < values.length; i++) {
            treatment.setRelation(self.sicknesses[i], values[i]);
        }
    }
}

GameState.prototype.init = function() {
    this.level.init();
};

GameState.prototype.isBlocked = function(target) {
    return this.level.isBlocked(target);
};

GameState.prototype.getBed = function(target) {
    return this.level.getBed(target);
};

GameState.prototype.getRandomFreeBed = function() {

    const freeBeds = this.getFreeBeds();
    return getRandomItem(freeBeds);
};

GameState.prototype.getFreeBeds = function() {
    return this.level.beds.filter(bed => !bed.occupiedBy && this.patients.every(p => !(p.targetBed == bed)));
};

GameState.prototype.allBedsOccupied = function() {

    return (this.getFreeBeds().length === 0);
};

GameState.prototype.removePatient = function(patient) {
    this.patients = this.patients.filter(p => p != patient);
};

GameState.prototype.registerPoliceBribery = function() {
    this.policyBriberyAttempts++;
    if (this.policyBriberyAttempts < 3) {
        this.lastBriberyAttempt = gameStage.time;
        return true;
    }
    this.setGameOver("gameover", 800, 1);
    return false;
};

GameState.prototype.setGameOver = function(stage, duration, payload) {

    if (!this.gameOver) {
        this.gameOver = true;
        gameStage.transitionIn(stage, duration, payload);
    }
};