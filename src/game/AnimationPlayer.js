/*

- migrate existing animations: patient, facility manager, cars
- support for isDead: start animation for specific timeframe
- support for braking car
- improve walking sound (in the worst case by reverting the placement of stop-call)
- re-implement animationOffset

 */

function AnimationPlayer(getTimeCallback, tileScale) {

    this.getTimeCallback = getTimeCallback;
    this.tileScale = tileScale;
    this.sprites = [];
    this.animations = [];
}

AnimationPlayer.prototype.loadSprites = function(spriteSetId, filename,
    frameCountX = 1, frameCountY = 1) {

    if (!this.getSpriteSet(spriteSetId)) {
        let spriteSet = loader.loadImage(filename, frameCountX, frameCountY);
        this.sprites.push({id: spriteSetId, spriteSet: spriteSet,
            frameCount: frameCountX * frameCountY});
    }
};

AnimationPlayer.prototype.createAnimation = function(animationId) {

    if (!this.getAnimation(animationId)) {
        // animationId = name + state <- create wrapper for concat
        this.animations.push({id: animationId, spriteSets: [], status: []});
    }
};

/**
 *
 * @param animationId
 * @param spriteSetId
 * @param speed
 *      Milliseconds per frame.
 * @param reportFrameChange
 * @param frameIndexes
 */
AnimationPlayer.prototype.addAnimation = function(animationId, spriteSetId, speed, frameIndexes = []) {

    let animation = this.getAnimation(animationId);
    let spriteSet = this.getSpriteSet(spriteSetId);
    if (animation && spriteSet) {
        if (frameIndexes.length === 0) {
            for (let i=0; i < spriteSet.frameCount; i++) {
                frameIndexes.push(i);
            }
        }
        animation.spriteSets.push({id: spriteSetId, frameIndexes: frameIndexes,
            lastPaintedFrameIndex: NaN, speed: speed});
        animation.status.push({spriteSetId: spriteSetId, currentFrame: NaN, totalFrames: frameIndexes.length, changed: false});
    } else {
        throw new Error("animation " + animationId + " not found!");
    }
};

AnimationPlayer.prototype.getAnimation = function(id) {

    let animation;
    for (let i=0; i<this.animations.length; i++) {
        if (this.animations[i].id === id) {
            animation = this.animations[i];
            break;
        }
    }
    return animation;
};

AnimationPlayer.prototype.getSpriteSet = function(id) {

    let spriteSet;
    for (let i=0; i<this.sprites.length; i++) {
        if (this.sprites[i].id === id) {
            spriteSet = this.sprites[i];
            break;
        }
    }
    return spriteSet;
};

AnimationPlayer.prototype.paint = function(ctx, animationId, tileX, tileY, centerPercentX, centerPercentY,
    mirrorX = false, mirrorY = false, rotationAngle = 0) {

    let animation = this.getAnimation(animationId);
    if (animation) {
        let status = animation.status;
        for (let i=0; i < animation.spriteSets.length; i++) {
            let spriteSetDesc = animation.spriteSets[i];
            let spriteSetId = spriteSetDesc.id;
            let spriteSet = this.getSpriteSet(spriteSetId);
            let indexes = spriteSetDesc.frameIndexes;
            let speed = spriteSetDesc.speed;

            const spriteIndex = Math.floor((this.getTimeCallback() / speed) % indexes.length);
            status[i].currentFrame = spriteIndex;
            if (spriteIndex !== spriteSetDesc.lastPaintedFrameIndex) {
                spriteSetDesc.lastPaintedFrameIndex = spriteIndex;
                status[i].changed = true;
            } else {
                status[i] = false;
            }

            drawFrame(ctx, spriteSet.spriteSet, indexes[spriteIndex], tileX, tileY,
                rotationAngle, (mirrorX ? -1 : 1) / this.tileScale, (mirrorY ? -1 : 1) / this.tileScale,
                centerPercentX, centerPercentY);

        }
        return status;
    } else {
        throw new Error("animation " +  animationId + " not defined");
    }
};
