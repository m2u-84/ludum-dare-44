function GameState() {
    // the level
    this.level = new Level();
    // the hospital
    this.hospital = new Hospital();
    // the doctor
    this.doctor = new Doctor(13, 15, 0.5, 0.1, this);
    // possible treatments
    this.treatments = {
        placebo: new Treatment('Medication with Placebo', 100, 1),
        aspirin: new Treatment('Medication with Aspirin and Ibuprofen', 150, 20),
        psychotropics: new Treatment('Medication with Psychotropics', 200, 50),
        placeboSurgery: new Treatment('Surgery', 1000, 20), 
        surgery: new Treatment('Surgery', 1000, 500),
        imodium: new Treatment('Medication with Imodium A-D', 150, 20),
        antibiotics: new Treatment('Medication with Antibiotics', 500, 100)
    };
    // common sicknesses
    this.sicknesses = [
        new Sickness(0.0, 'Hypochondria', this.treatments.placebo),
        new Sickness(0.1, 'Common Cold', this.treatments.aspirin),
        new Sickness(0.2, 'Demonic Posession', this.treatments.placeboSurgery),
        new Sickness(0.2, 'Depression', this.treatments.psychotropics),
        new Sickness(0.2, 'Bone Fracture', this.treatments.surgery),
        new Sickness(0.3, 'Influenza', this.treatments.aspirin),
        new Sickness(0.2, 'Diarrhea', this.treatments.imodium),
        new Sickness(0.6, 'Apoplectic Stroke', this.treatments.surgery), 
        new Sickness(0.8, 'Anthrax', this.treatments.antibiotics), 
        new Sickness(0.8, 'Lung Cancer', this.treatments.surgery),
        new Sickness(0.8, 'Heart Attack', this.treatments.surgery)
    ];
    // start with 0 patients
    this.patients = [];
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