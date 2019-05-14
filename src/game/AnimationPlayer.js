/*

- improve walking sound (in the worst case by reverting the placement of stop-call)

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
 * @param continuous
 * @param frameIndexes
 */
AnimationPlayer.prototype.addAnimation = function(animationId, spriteSetId, speed, continuous = true, randomized = true, frameIndexes = []) {

    let animation = this.getAnimation(animationId);
    let spriteSet = this.getSpriteSet(spriteSetId);
    if (animation && spriteSet) {
        if (frameIndexes.length === 0) {
            for (let i=0; i < spriteSet.frameCount; i++) {
                frameIndexes.push(i);
            }
        }
        const randomization = randomized ? rnd(9999) : 0;
        animation.spriteSets.push({id: spriteSetId, frameIndexes: frameIndexes,
            lastPaintedFrameIndex: NaN, speed: speed, continuous: continuous, randomization: randomization});
        animation.status.push({spriteSetId: spriteSetId, currentFrame: NaN, totalFrames: frameIndexes.length,
            startTime: NaN, percentage: NaN, changed: false});
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
            let continuous = spriteSetDesc.continuous;
            let startTime = status[i].startTime;

            let spriteIndex;
            if (continuous) {
                const offset = spriteSetDesc.randomization;
                const floatIndex = (this.getTimeCallback() + offset) / (speed + offset % 80);
                const modulusFloatIndex = floatIndex % indexes.length;
                spriteIndex = Math.floor(modulusFloatIndex);
                status[i].percentage = modulusFloatIndex - spriteIndex;
            } else {
                let percentage = Math.min(1, (this.getTimeCallback() - startTime) / speed);
                spriteIndex = Math.floor(percentage * (indexes.length  - 1));
                status[i].percentage = percentage;
            }
            status[i].currentFrame = spriteIndex;
            if (spriteIndex !== spriteSetDesc.lastPaintedFrameIndex) {
                spriteSetDesc.lastPaintedFrameIndex = spriteIndex;
                status[i].changed = true;
            } else {
                status[i].changed = false;
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

AnimationPlayer.prototype.startAnimation = function(animationId) {

    let animation = this.getAnimation(animationId);
    if (animation) {
        for (let i=0; i < animation.spriteSets.length; i++) {
            let spriteSetDesc = animation.spriteSets[i];
            let continuous = spriteSetDesc.continuous;
            if (!continuous) {
                animation.status[i].startTime = this.getTimeCallback();
            }
        }
    } else {
        throw new Error("animation " +  animationId + " not defined");
    }
};

AnimationPlayer.prototype.getAnimationStatus = function(animationId) {

    let animation = this.getAnimation(animationId);
    if (animation) {
        return animation.status;
    } else {
        throw new Error("animation " +  animationId + " not defined");
    }
};