function GameState() {
    this.level = new Level();
    this.hospital = new Hospital();
    this.doctor = new Doctor(13, 12.8, 0.5, 0.1, this);
    this.facilityManager = null;
    this.closestPatientToDoctor = null;

    // possible treatments
    this.treatments = {
        drugs: new Treatment('Prescribe Drugs', 150, 20),
        placeboSurgery: new Treatment('Placebo Surgery', 1000, 20),
        surgery: new Treatment('Proper Surgery', 1000, 500),
        organ: new Treatment('Give Organ', 150, 20),
        antibiotics: new Treatment('Medication with Antibiotics', 500, 100),
        takeOrgan: new Treatment('Take Organ', 150, 20),
        fixLeg: new Treatment('Fix Fracture', 150, 20)
    };
    // common sicknesses
    var self = this;
    this.sicknesses = [
        new Sickness(0.0, 'Hypochondria', this.treatments.placeboSurgery),
        new Sickness(0.1, 'Common Cold', this.treatments.drugs),
        new Sickness(0.2, 'Demonic Posession', this.treatments.takeOrgan),
        new Sickness(0.2, 'Depression', this.treatments.drugs),
        new Sickness(0.2, 'Bone Fracture', this.treatments.fixLeg),
        new Sickness(0.3, 'Influenza', this.treatments.drugs),
        new Sickness(0.2, 'Diarrhea', this.treatments.antibiotics),
        new Sickness(0.6, 'Stroke', this.treatments.surgery),
        new Sickness(0.8, 'Anthrax', this.treatments.antibiotics),
        new Sickness(0.8, 'Kidney Failure', this.treatments.organ),
        new Sickness(0.8, 'Lung Cancer', this.treatments.surgery)
    ];
    // Relations between sickness & treatment     Hyp  CCl  Dem  Dep  Frc  Flu  Drh  Stk  Ant  Kid  Cnc
    setRelations(this.treatments.drugs,          [0.5, 1.0, 0.0, 0.6, 0.0, 0.8, 0.2, 0.1, 0.3, 0.0, 0.1]);
    setRelations(this.treatments.placeboSurgery, [1.0, 0.6, 0.3, 0.2, 0.0, 0.0,-0.3, 0.0, 0.0,-0.1, 0.1]);
    setRelations(this.treatments.surgery,        [0.5,-0.5, 0.2,-0.6,-0.3,-0.8, 0.2,-0.4,-0.3, 0.2, 0.7]);
    setRelations(this.treatments.organ,          [0.6,-0.3,-0.2,-0.3,-0.2,-0.5, 0.1,-0.2, 0.2, 0.6, 0.4]);
    setRelations(this.treatments.antibiotics,    [0.3, 0.1, 0.2, 0.0, 0.0, 0.3, 0.7, 0.0, 0.5, 0.1,-0.1]);
    setRelations(this.treatments.takeOrgan,      [0.1,-1.0, 1.0,-0.4,-1.0,-1.0,-0.6,-1.0,-1.0, 0.0,-0.8]);
    setRelations(this.treatments.fixLeg,         [0.2,-0.3, 0.0,-0.2, 1.0,-0.4,-0.5,-0.3,-0.4,-0.5,-0.4]);

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
}

GameState.prototype.isBlocked = function(target) {
    return this.level.isBlocked(target);
}

GameState.prototype.getBed = function(target) {
    return this.level.getBed(target);
}

GameState.prototype.getRandomFreeBed = function() {
    const freeBeds = this.level.beds.filter(bed => !bed.occupiedBy && this.patients.every(p => !(p.targetBed == bed)));
    return getRandomItem(freeBeds);
}

GameState.prototype.removePatient = function(patient) {
    this.patients = this.patients.filter(p => p != patient);
}