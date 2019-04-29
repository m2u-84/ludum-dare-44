function GameState() {
    this.level = new Level();
    this.hospital = new Hospital();
    this.doctor = new Doctor(11, 12.8, 0.5, 0.1, this);
    this.cars = [];
    this.facilityManager = null;
    this.closestPatientToDoctor = null;
    this.policyBriberyAttempts = 0;
    this.danegeld = 1000;
    this.stats = {
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

    this.releaseTreatment = new Treatment('Release as cured',      0,    0,  0.0,  0.0);
    // possible treatments
    this.treatments = {
        //                            name        sleepTime[s]   price pat|hosp  failure
        drugs:          new Treatment('Prescribe Drugs',     5,      100,   10,  0.0,  0.0),
        placeboSurgery: new Treatment('Placebo Surgery',    10,     1000,   80,  0.0,  0.0),
        // surgery:        new Treatment('Proper Surgery',     20,     1000,  500, -0.1, -0.3),
        organ:          new Treatment('Give Organ',         30,     5000, 1000, -0.1, -0.3, () => this.hospital.organs > 0),
        antibiotics:    new Treatment('Give Antibiotics',    5,      200,   40, -0.1, -0.1),
        takeOrgan:      new Treatment('Take Organ',         30,     2000,  500, -0.2, -0.4, (p) => p.hasOrgan),
        fixLeg:         new Treatment('Fix Fracture',       20,      800,  220, -0.1, -0.3)
    };
    this.treatmentArray = Object.keys(this.treatments).map(key => this.treatments[key]);
    this.receptions = [
        new Treatment("Accept", 0, 0, 0, 0, 0, () => !this.allBedsOccupied()),
        new Treatment("Send Away", 0, 0, 0, 0, 0)
    ];
    // common sicknesses
    var self = this;
    this.sicknesses = [
        new Sickness(0.0, 'Hypochondria', this.treatments.placeboSurgery),
        new Sickness(0.1, 'Common Cold', this.treatments.drugs),
        new Sickness(0.2, 'Demonic Possession', this.treatments.takeOrgan),
        new Sickness(0.2, 'Depression', this.treatments.drugs),
        new Sickness(0.2, 'Bone Fracture', this.treatments.fixLeg),
        new Sickness(0.3, 'Influenza', this.treatments.drugs),
        new Sickness(0.2, 'Diarrhea', this.treatments.antibiotics),
        // new Sickness(0.6, 'Stroke', this.treatments.surgery),
        new Sickness(0.8, 'Anthrax', this.treatments.antibiotics),
        new Sickness(0.8, 'Kidney Failure', this.treatments.organ),
        // new Sickness(0.8, 'Lung Cancer', this.treatments.surgery)
    ];
    // Relations between sickness & treatment     Hyp  CCl  Dem  Dep  Frc  Flu  Drh    Stk  Ant  Kid     Cnc
    setRelations(this.treatments.drugs,          [0.5, 1.0, 0.0, 0.6, 0.0, 0.8, 0.2/* 0.1*/, 0.3, 0.0/* 0.1*/]);
    setRelations(this.treatments.placeboSurgery, [1.0, 0.6, 0.3, 0.2, 0.0, 0.0,-0.3/* 0.0*/, 0.0,-0.1/* 0.1*/]);
    // setRelations(this.treatments.surgery,        [0.5,-0.5, 0.2,-0.6,-0.3,-0.8, 0.2,-0.4,-0.3, 0.2,0.7]);
    setRelations(this.treatments.organ,          [0.6,-0.3,-0.2,-0.3,-0.2,-0.5, 0.1/*-0.2*/, 0.2, 0.6/* 0.4*/]);
    setRelations(this.treatments.antibiotics,    [0.3, 0.1,-0.1, 0.0, 0.0, 0.3, 0.7/* 0.0*/, 0.5,-0.1/*-0.1*/]);
    setRelations(this.treatments.takeOrgan,      [0.1,-1.0, 1.0,-0.4,-1.0,-1.0,-0.6/*-1.0*/,-1.0, 0.0/*-0.8*/]);
    setRelations(this.treatments.fixLeg,         [0.2,-0.3, 0.0,-0.2, 1.0,-0.4,-0.5/*-0.3*/,-0.4,-0.5/*-0.4*/]);

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
    if (this.policyBriberyAttempts < 2) {
        this.policyBriberyAttempts++;
        return true;
    }
    gameStage.transitionIn("gameover", 800, 1);
    return false;
};