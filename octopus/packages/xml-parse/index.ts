import { XMLParser } from "fast-xml-parser";
import { file } from "bun";
import { join } from "node:path";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
});

type TPng = {
  "@_name": string;
  "@_value": string;
};
type TDir = {
  "@_name": string;
  dir?: TDir[] | TDir;
  png?: TPng[] | TPng;
};
type TXml = {
  "@_name": string;
  dir: TDir;
};

const EVENT_NAME = "2507EverniaTrader";

const json = xmlParser.parse(await file("src/data.xml").text()) as TXml;
const { dir } = json.dir;

const savePngs = async (pngs: TPng[], path: string) => {
  for (const { "@_name": name, "@_value": value } of pngs) {
    await file(join(path, `${name}.png`).replace(/:/g, "-")).write(
      Buffer.from(value, "base64")
    );
  }
};

const recurDirs = async (dirs: TDir[], path: string) => {
  for (const { "@_name": name, dir, png } of dirs) {
    const nextPath = join(path, name);

    if (dir) {
      await recurDirs([dir].flat(), nextPath);
    }

    if (png) {
      await savePngs([png].flat(), nextPath);
    }
  }
};

if (dir) {
  const eventDir = [dir].flat().filter((a) => a["@_name"] === EVENT_NAME);

  recurDirs(eventDir, "");
}
