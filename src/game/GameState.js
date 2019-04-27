function GameState() {
    this.level = new Level();
    this.doctor = new Doctor(13, 15, 0.5, 0.5, this);
    
    this.sicknesses = [
        new Sickness(0.1, 'Common Cold', 'Medication with Aspirin and Ibuprofen'),
        new Sickness(0.3, 'Influenza', 'Medication with Aspirin and Ibuprofen'),
        new Sickness(0.2, 'Diarrhea', 'Medication with Imodium A-D'),
        new Sickness(0.2, 'Diarrhea', 'Medication with Imodium A-D'),
    ];
    
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