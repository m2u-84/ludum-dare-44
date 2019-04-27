

function drawImage(ctx, image, x = 0, y = 0, angle = 0, scaleX = 1, scaleY = scaleX, centerX = 0.5, centerY = 0.5, alpha = 1) {
  ctx.save();
  if (alpha !== 1) {
    ctx.globalAlpha *= alpha;
  }
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scaleX, scaleY);
  ctx.drawImage(image, -image.width * centerX, -image.height * centerY);
  ctx.restore();
}

function drawFrame(ctx, image, frame, x = 0, y = 0, angle = 0, scaleX = 1, scaleY = scaleX, centerX = 0.5, centerY = 0.5, alpha = 1) {
  frame = absMod(frame, image.frameCount);
  const frameWidth = image.frameWidth;
  const frameHeight = image.frameHeight;
  ctx.save();
  if (alpha !== 1) {
    ctx.globalAlpha *= alpha;
  }
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scaleX, scaleY);
  const frameX = frame % image.frameCountX, frameY = Math.floor(frame / image.frameCountX);
  ctx.drawImage(image, frameWidth * frameX, frameHeight * frameY, frameWidth, frameHeight, -frameWidth * centerX, -frameHeight * centerY, frameWidth, frameHeight);
  ctx.restore();
}
