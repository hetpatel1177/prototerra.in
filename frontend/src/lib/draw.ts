import { lerp } from './math';

export const drawHero = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    progress: number,
    width: number,
    height: number,
    disableEffects: boolean = false
) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!image) return;

    // --- 1. Settings calculated from scroll progress ---
    // Scale: 1 -> 1.35 (Disable if using sequence that has its own motion)
    const scale = disableEffects ? 1 : lerp(1, 1.35, progress);

    // Blur: 8px -> 0px
    const blurAmount = disableEffects ? 0 : lerp(8, 0, progress);

    // Brightness: 0.6 -> 1
    // We keep brightness transition as it fits the "Reveal" narrative even for sequences.
    const brightness = lerp(0.6, 1, progress);

    // --- 2. Calculate Draw Dimensions (Center Crop + Scale) ---
    const imgAspect = image.width / image.height;
    const canvasAspect = width / height;

    let drawWidth, drawHeight, offsetX, offsetY;

    // Calculate "cover" dimensions first
    if (canvasAspect > imgAspect) {
        drawWidth = width;
        drawHeight = width / imgAspect;
    } else {
        drawHeight = height;
        drawWidth = height * imgAspect;
    }

    // Apply scale
    const scaledWidth = drawWidth * scale;
    const scaledHeight = drawHeight * scale;

    // Center the image
    offsetX = (width - scaledWidth) / 2;
    offsetY = (height - scaledHeight) / 2;

    // --- 3. Draw ---
    ctx.save();

    // Apply filters
    if (!disableEffects) {
        ctx.filter = `blur(${Math.max(0, blurAmount)}px) brightness(${brightness})`;
    } else {
        // Just brightness for sequence
        ctx.filter = `brightness(${brightness})`;
    }

    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    ctx.restore();

    // --- 4. Overlays ---

    // Vignette (Radial Gradient)
    const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.4, // Start closer to center
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
    );
    gradient.addColorStop(0, 'rgba(5, 5, 5, 0)');
    gradient.addColorStop(1, 'rgba(5, 5, 5, 0.6)'); // Darker edges

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
};
