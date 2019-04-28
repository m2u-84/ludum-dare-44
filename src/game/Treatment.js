/**
 * 
 */
function Treatment(name, costsForPatient, costsForHospital) {
    this.name = name;
    this.costsForPatient = costsForPatient;
    this.costsForHospital = costsForHospital;
    this.effects = {};
}

Treatment.prototype.setRelation = function(sickness, effect) {
    this.effects[sickness.name] = effect;
};

/**
 * Gets sickness, returns value between -1 and 1 representing whether in any particular case of that sickness this treatment helps or not.
 */
Treatment.prototype.getRandomizedEffect = function(sickness) {
    if (sickness instanceof Sickness) { sickness = sickness.name; }
    const base = this.effects[sickness];
    const mid = -0.6*Math.cos(Math.PI * base);
    const effect = mid + rnd(0.4) - rnd(0.4);
    return effect;
};
