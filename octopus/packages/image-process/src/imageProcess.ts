import { decode, toRGBA8 } from "upng-js";
import { levelData, tryCountData } from "./pixel.json"; // with { type: 'json' };
import { chunk, isEqual } from "es-toolkit";

type Level = keyof typeof levelData;
type TryCount = keyof typeof tryCountData;
type Pixel = [number, number, number, number];

const findLevelFromScreenshot = async (
  screenshot: ArrayBuffer
): Promise<number | null> => {
  const image = decode(screenshot);
  const { width } = image;
  const rawPixels = [...new Uint8Array(toRGBA8(image)[0]!)];
  const screenshotPixels = chunk(rawPixels, 4) as Pixel[];

  for (const [index] of screenshotPixels.entries()) {
    const x = index % width;
    const y = Math.floor(index / width);

    const isMatchingWithLevel = (level: Level) =>
      levelData[level].every(({ dx, dy, pixel: levelPixel }) => {
        const screenshotPixel = screenshotPixels[(y + dy) * width + (x + dx)];

        return isEqual(levelPixel, screenshotPixel);
      });
    const level = (Object.keys(levelData) as Level[]).find(isMatchingWithLevel);

    if (level) {
      return Number(level);
    }
  }

  return null;
};

const findTryCountFromScreenshot = async (
  screenshot: ArrayBuffer
): Promise<number | null> => {
  const counts: TryCount[] = [];

  const image = decode(screenshot);
  const { width } = image;
  const rawPixels = [...new Uint8Array(toRGBA8(image)[0]!)];
  const screenshotPixels = chunk(rawPixels, 4) as Pixel[];

  for (const [index] of screenshotPixels.entries()) {
    const x = index % width;
    const y = Math.floor(index / width);

    const isMatchingWithTryCount = (tryCount: TryCount) =>
      tryCountData[tryCount].every(({ dx, dy, pixel: tryCountPixel }) => {
        const screenshotPixel = screenshotPixels[(y + dy) * width + (x + dx)];

        return isEqual(tryCountPixel, screenshotPixel);
      });

    const tryCount = (Object.keys(tryCountData) as TryCount[]).find(
      isMatchingWithTryCount
    );

    if (tryCount) {
      counts.push(tryCount);
      continue;
    }
  }

  return counts.length ? Number(counts.join("")) : null;
};

export const getLevelAndTryCountFromFile = async (file: File) => {
  const buffer = await file.arrayBuffer();

  return {
    level: await findLevelFromScreenshot(buffer),
    tryCount: await findTryCountFromScreenshot(buffer),
  };
};
