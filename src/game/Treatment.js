/**
 * 
 */
function Treatment(name, sleepTime, costsForPatient, costsForHospital, failureRegenerative = 0.3,
        failureAbsolute = failureRegenerative, riskOfDeath = 0, enabledCallback = () => true) {
    this.name = name;
    this.sleepTime = sleepTime * 1000;
    this.costsForPatient = costsForPatient;
    this.costsForHospital = costsForHospital;
    this.effects = {};
    this.failureRegenerative = failureRegenerative;
    this.failureAbsolute = failureAbsolute;
    this.riskOfDeath = riskOfDeath;
    this.enabledCallback = enabledCallback;
}

Treatment.prototype.setRelation = function(sickness, effect) {
    this.effects[sickness.name] = effect;
};

Treatment.prototype.getBaseSafetyFor = function(sickness) {
    if (sickness instanceof Sickness) { sickness = sickness.name; }
    const base = 0.5 + 0.5 * this.effects[sickness];
    return base;
};

Treatment.prototype.getRiskOfDeath = function() {
    return this.riskOfDeath;
};

/**
 * Gets sickness, returns value between -1 and 1 representing whether in any particular case of that sickness this treatment helps or not.
 */
Treatment.prototype.getRandomizedEffect = function(sickness) {
    const base = this.getBaseSafetyFor(sickness);
    const mid = -0.6*Math.cos(Math.PI * base);
    const effect = mid + rnd(0.4) - rnd(0.4);
    return effect;
};

Treatment.prototype.getFailureEffects = function() {
    return {
        regenerative: this.failureRegenerative,
        absolute: this.failureAbsolute
    };
};

Treatment.prototype.isEnabled = function(patient) {
    const price = patient.getTreatmentPrice(this);
    return this.enabledCallback(patient) && (!price || price > 0 || Math.abs(price) <= gameStage.gameState.hospital.balance);
};
