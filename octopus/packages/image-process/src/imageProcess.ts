import { decode, toRGBA8 } from "upng-js";
import { levelData, tryCountData } from "./pixel.json"; // with { type: 'json' };
import { chunk, isEqual } from "es-toolkit";

type Level = keyof typeof levelData;
type TryCount = keyof typeof tryCountData;
type Pixel = [number, number, number, number];

const commonLevelData = levelData["1"].filter((level1Data, index) =>
  Object.values(levelData)
    .slice(1)
    .every((data) => isEqual(level1Data, data[index]))
);
for (const level of Object.keys(levelData) as Level[]) {
  levelData[level] = levelData[level].filter(
    (data) => !commonLevelData.find((common) => isEqual(common, data))
  );
}

const findLevelAndTryCountFromScreenshot = (
  screenshotPixels: Pixel[],
  width: number
): { level: number | null; tryCount: number | null } => {
  const counts: TryCount[] = [];

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

    const isRefCoord = commonLevelData.every(
      ({ dx, dy, pixel: commonLevelPixel }) => {
        const screenshotPixel = screenshotPixels[(y + dy) * width + (x + dx)];

        return isEqual(commonLevelPixel, screenshotPixel);
      }
    );

    if (!isRefCoord) {
      continue;
    }

    const isMatchingWithLevel = (level: Level) =>
      levelData[level].every(({ dx, dy, pixel: levelPixel }) => {
        const screenshotPixel = screenshotPixels[(y + dy) * width + (x + dx)];

        return isEqual(levelPixel, screenshotPixel);
      });
    const level = (Object.keys(levelData) as Level[]).find(isMatchingWithLevel);

    if (level) {
      return {
        level: Number(level),
        tryCount: counts.length ? Number(counts.join("")) : null,
      };
    }

    break;
  }

  return { level: null, tryCount: null };
};

export const getLevelAndTryCountFromFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const image = decode(buffer);
  const rawPixels = [...new Uint8Array(toRGBA8(image)[0]!)];
  const screenshotPixels = chunk(rawPixels, 4) as Pixel[];

  return findLevelAndTryCountFromScreenshot(screenshotPixels, image.width);
};
