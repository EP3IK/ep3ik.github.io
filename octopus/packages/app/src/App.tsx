import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import "./index.css";

import { Button } from "@/components/ui/button";
import { getLevelAndTryCountFromFile } from "@octopus/image-process";
import { isNil, noop } from "es-toolkit";
import { useEffect, useState, type FC } from "react";
import { isFileSystemApiAvailable } from "./lib/fileSystem";
import { calculateExpectationsByTargetLevel } from "./lib/probability";
import { cn } from "./lib/utils";

export const App: FC = () => {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle>();
  const [latestPngFile, setLatestPngFile] = useState<File>();
  const [levelAndTryCount, setLevelAndTryCount] = useState<{
    level?: number;
    tryCount?: number;
  }>({});
  const { level, tryCount } = levelAndTryCount;

  const analyzePngFile = async () => {
    if (!dirHandle) {
      return;
    }

    const pngFiles = (
      await Array.fromAsync(dirHandle.entries(), async ([, handle]) => {
        if (handle.kind === "directory") {
          return;
        }

        const file = await handle.getFile();

        if (file.type !== "image/png") {
          return;
        }

        return file;
      })
    ).filter((file) => file);

    setLatestPngFile(
      pngFiles.toSorted((a, b) => b.lastModified - a.lastModified)[0]
    );
  };
  useEffect(() => {
    analyzePngFile();
  }, [dirHandle]);

  useEffect(() => {
    console.log("파일:", latestPngFile);
    setLevelAndTryCount({});

    if (latestPngFile) {
      getLevelAndTryCountFromFile(latestPngFile).then(setLevelAndTryCount);
    }

    const interval = setInterval(analyzePngFile, 5000);

    return () => clearInterval(interval);
  }, [dirHandle, latestPngFile?.name]);

  const isLoading = isNil(level) && isNil(tryCount);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-muted mt-4">
      <CardHeader>메이플스토리 에버니아 무역왕 기댓값 계산기</CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        {isLoading ? (
          <>
            {latestPngFile && (
              <p className="text-sm font-bold">시도 횟수: ... / 레벨: ...</p>
            )}
            <div className="w-full flex flex-col gap-1">
              <h3 className="w-full text-left text-sm font-medium text-gray-700">
                인게임 필수 설정
              </h3>
              <ul className="w-full list-disc list-inside text-gray-500 pl-1">
                <li className="w-full text-left text-sm">
                  UI {">"} UI 크기: 최적 비율
                </li>
                <li className="w-full text-left text-sm">
                  스크린샷 {">"} 파일 형식: PNG
                </li>
              </ul>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h3 className="w-full text-left text-sm font-medium text-gray-700">
                스크린샷 인식이 안 되면...
              </h3>
              <ul className="w-full list-disc list-inside text-gray-500 pl-1">
                <li className="w-full text-left text-sm">
                  무역왕 UI가 있는지 확인
                </li>
                <li className="w-full text-left text-sm">
                  무역왕 UI를 다른 UI가 가리지 않았는지 확인
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-bold">
              시도 횟수: {tryCount} / 레벨: {level}
            </p>
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 p-4 pt-0 pb-3 text-left font-medium text-gray-400 dark:border-gray-600 dark:text-gray-200">
                    단계
                  </th>
                  <th className="border-b border-gray-200 p-4 pt-0 pb-3 text-left font-medium text-gray-400 dark:border-gray-600 dark:text-gray-200">
                    기댓값
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculateExpectationsByTargetLevel(level, tryCount).map(
                  (
                    [targetLevel, expectation],
                    _,
                    expectationsByTargetLevel
                  ) => {
                    const tdClass = cn(
                      "p-4 py-2 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400",
                      expectation > expectationsByTargetLevel[0][1] &&
                        "font-medium",
                      expectation ===
                        Math.max(
                          ...expectationsByTargetLevel.map(
                            ([, anExpectation]) => anExpectation
                          )
                        ) && "font-extrabold",
                      expectation < expectationsByTargetLevel[0][1] &&
                        "text-gray-300"
                    );

                    return (
                      <tr key={targetLevel}>
                        <td className={tdClass}>{targetLevel}</td>
                        <td className={tdClass}>{expectation.toFixed(4)}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </>
        )}
        {latestPngFile && (
          <img className="w-3xs" src={URL.createObjectURL(latestPngFile)} />
        )}
        {isFileSystemApiAvailable ? (
          <Button
            className="w-full"
            onClick={async () => {
              const dirHandle = await showDirectoryPicker().catch(noop);

              if (dirHandle) {
                setDirHandle(dirHandle);
              }
            }}
          >
            메이플스토리 스크린샷 폴더 선택
          </Button>
        ) : (
          <CardDescription>
            <p>지원하지 않는 브라우저입니다.</p>
            <p>최신 버전의 Chrome, Edge, Opera 브라우저를 사용하세요.</p>
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default App;
