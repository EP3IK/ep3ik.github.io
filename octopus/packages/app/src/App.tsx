import { Card, CardContent } from "@/components/ui/card";
import "./index.css";

import { Button } from "@/components/ui/button";
import { getLevelAndTryCountFromFile } from "@octopus/image-process";
import { Suspense, useEffect, useState, type FC } from "react";
import { isFileSystemApiAvailable } from "./lib/fileSystem";
import { calculateExpectationsByTargetLevel } from "./lib/probability";
import { cn } from "./lib/utils";

// export function App() {
//   return (
//     <div className="container mx-auto p-8 text-center relative z-10">
//       <div className="flex justify-center items-center gap-8 mb-8">
//         <img
//           src={logo}
//           alt="Bun Logo"
//           className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
//         />
//         <img
//           src={reactLogo}
//           alt="React Logo"
//           className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
//         />
//       </div>

//       <Card className="bg-card/50 backdrop-blur-sm border-muted">
//         <CardContent className="pt-6">
//           <h1 className="text-5xl font-bold my-4 leading-tight">Bun + React</h1>
//           <p>
//             Edit{" "}
//             <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">src/App.tsx</code> and
//             save to test HMR
//           </p>
//           <APITester />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

export const App: FC = () => {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle>();
  const [latestPngFile, setLatestPngFile] = useState<File>();
  const [levelAndTryCount, setLevelAndTryCount] = useState<{
    level?: number;
    tryCount?: number;
  }>({});

  const analyzePngFile = async () => {
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
    if (dirHandle) {
      analyzePngFile();
    }
  }, [dirHandle]);

  useEffect(() => {
    console.log("파일:", latestPngFile);
    setLevelAndTryCount({});

    if (!latestPngFile) {
      return;
    }

    getLevelAndTryCountFromFile(latestPngFile).then(setLevelAndTryCount);

    const interval = setInterval(analyzePngFile, 5000);

    return () => clearInterval(interval);
  }, [latestPngFile?.name]);

  if (!isFileSystemApiAvailable) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-muted">
        <CardContent className="pt-6">
          <p>지원하지 않는 브라우저입니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <Button
        onClick={async () => {
          const dirHandle = await showDirectoryPicker().catch(() => {});

          if (dirHandle) {
            setDirHandle(dirHandle);
          }
        }}
      >
        메이플스토리 스크린샷 폴더 선택
      </Button>
      <Card className="bg-card/50 backdrop-blur-sm border-muted mt-4">
        <CardContent className="pt-6">
          {latestPngFile ? (
            <div>
              <p>
                시도 횟수: {levelAndTryCount.tryCount ?? "..."} / 레벨:{" "}
                {levelAndTryCount.level ?? "..."}
              </p>
              {typeof levelAndTryCount.level === "number" &&
                typeof levelAndTryCount.tryCount === "number" && (
                  <table className="my-6 w-full table-auto border-collapse text-sm">
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
                      {calculateExpectationsByTargetLevel(
                        levelAndTryCount.level,
                        levelAndTryCount.tryCount
                      ).map(
                        (
                          [targetLevel, expectation],
                          _,
                          expectationsByTargetLevel
                        ) => {
                          const tdClass = cn(
                            expectation > expectationsByTargetLevel[0][1] &&
                              "font-medium",
                            expectation ===
                              Math.max(
                                ...expectationsByTargetLevel.map(
                                  ([, anExpectation]) => anExpectation
                                )
                              ) && "font-extrabold",
                            expectation < expectationsByTargetLevel[0][1] &&
                              "text-gray-200",
                            "p-4 py-2 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400"
                          );

                          return (
                            <tr key={targetLevel}>
                              <td className={tdClass}>{targetLevel}</td>
                              <td className={tdClass}>
                                {expectation.toFixed(4)}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                )}
              {latestPngFile && (
                <img src={URL.createObjectURL(latestPngFile)} width={200} />
              )}
            </div>
          ) : (
            <p>스크린샷을 선택해주세요.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
