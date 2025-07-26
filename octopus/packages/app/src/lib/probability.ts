import { range } from "es-toolkit";

const MAX_LEVEL = 9;
const MAX_TRY_COUNT = 100;
const LEVEL_COUNT = MAX_LEVEL + 1;

const rewards = [0, 0, 1, 3, 6, 10, 15, 25, 150, 500];
const baseProbabilitiesMatrix = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0.4, 0.6, 0, 0, 0, 0, 0, 0],
  [0, 0, 0.5, 0, 0.5, 0, 0, 0, 0, 0],
  [0, 0, 0, 0.6, 0, 0.4, 0, 0, 0, 0],
  [0, 0, 0, 0, 0.693, 0, 0.307, 0, 0, 0],
  [0.03, 0, 0, 0, 0, 0.765, 0, 0.205, 0, 0],
  [0.04, 0, 0, 0, 0, 0, 0.857, 0, 0.103, 0],
  [0.05, 0, 0, 0, 0, 0, 0, 0.9, 0, 0.05],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
];

const getTargetProbabilitiesMatrix = (targetLevel: number) =>
  structuredClone(baseProbabilitiesMatrix).with(
    targetLevel,
    Array(LEVEL_COUNT).fill(0).with(targetLevel, 1)
  );

const calculateProbabilities = (
  currentLevel: number,
  tryCount: number,
  targetProbabilitiesMatrix: number[][]
): number[] =>
  range(tryCount, MAX_TRY_COUNT).reduce(
    (probabilitiesAcc) =>
      range(LEVEL_COUNT).map((nextLevel) =>
        range(LEVEL_COUNT).reduce((acc, prevLevel) => {
          const prevLevelProbability = probabilitiesAcc[prevLevel];
          const probabilities = targetProbabilitiesMatrix[prevLevel];
          const nextLevelProbability = probabilities[nextLevel];

          return acc + prevLevelProbability * nextLevelProbability;
        }, 0)
      ),
    Array<number>(LEVEL_COUNT).fill(0).with(currentLevel, 1)
  );

export const calculateExpectationsByTargetLevel = (
  currentLevel: number,
  tryCount: number
): [targetLevel: number, expectation: number][] =>
  range(Math.max(currentLevel, 2), LEVEL_COUNT)
    .slice(0, MAX_TRY_COUNT - tryCount + 1)
    .map((targetLevel) => {
      const probabilities = calculateProbabilities(
        currentLevel,
        tryCount,
        getTargetProbabilitiesMatrix(targetLevel)
      );
      const expectation = rewards
        .map((x, i) => x * probabilities[i])
        .reduce((a, x) => a + x, 0);

      return [targetLevel, expectation];
    });
