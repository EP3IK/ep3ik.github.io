import { glob } from "node:fs/promises";
import { join } from "node:path";
import { file, write } from "bun";
import { decode, toRGBA8 } from "upng-js";
import { chunk } from "es-toolkit";

type Pixel = [number, number, number, number];
type PixelWithPoint = {
  dx: number;
  dy: number;
  pixel: Pixel;
};

const LEVEL_FILENAME_PATTERN = "../2507EverniaTrader/beforeLevel/*.png";
const TRY_COUNT_FILENAME_PATTERN =
  "../2507EverniaTrader/label-tryCount/bitmapNum/num/*.png";

const getPixelDataFromFilenamePattern = async (
  pattern: string
): Promise<Record<string, PixelWithPoint[]>> => {
  const data: Record<string, PixelWithPoint[]> = {};

  for await (const filepath of glob(join(__dirname, pattern))) {
    const filename = filepath.split("/").at(-1) ?? "";
    const level = /\d+/.exec(filename)?.[0] ?? "0";

    const imageBuffer = await file(filepath).arrayBuffer();
    const image = decode(imageBuffer);
    const { width } = image;
    const rawPixels = [...new Uint8Array(toRGBA8(image)[0]!)];

    for (const [index, pixel] of (chunk(rawPixels, 4) as Pixel[]).entries()) {
      const a = pixel[3];

      if (a !== 255) continue;

      const dx = index % width;
      const dy = Math.floor(index / width);

      if (!data[level]) {
        data[level] = [{ dx, dy, pixel }];
      } else {
        data[level].push({ dx, dy, pixel });
      }
    }
  }

  return data;
};

const main = async () => {
  const levelData = await getPixelDataFromFilenamePattern(
    LEVEL_FILENAME_PATTERN
  );
  const tryCountData = await getPixelDataFromFilenamePattern(
    TRY_COUNT_FILENAME_PATTERN
  );

  await write(
    join(__dirname, "../dist/pixel.json"),
    JSON.stringify({ levelData, tryCountData })
  );
};

main();
