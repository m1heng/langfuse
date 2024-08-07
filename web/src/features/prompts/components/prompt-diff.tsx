import useProjectIdFromURL from "@/src/hooks/useProjectIdFromURL";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";
import { diffArrays, diffLines, diffWords } from "diff";
import { useMemo } from "react";
import { type ChatMlArraySchema } from "@/src/components/schemas/ChatMlSchema";
import { type z } from "zod";

const diffChatMessages = (
  oldMl: z.infer<typeof ChatMlArraySchema>,
  newMl: z.infer<typeof ChatMlArraySchema>,
) => {
  const oldMlList = oldMl.map((ml, i) => ({ ...ml, side: "old", i }));
  const newMlList = newMl.map((ml, i) => ({ ...ml, side: "new", i }));
  const equalMap = new Map<number, number>();
  const arrayDiff = diffArrays(oldMlList, newMlList, {
    comparator: (left, right) => {
      const wordResult = diffWords(
        `${left.role}:${left.content}`,
        `${right.role}:${right.content}`,
      );
      const counts = wordResult.reduce(
        (acc, diff) => {
          if (diff.added) {
            acc.added += diff.count || 0;
          } else if (diff.removed) {
            acc.removed += diff.count || 0;
          } else {
            acc.noChange += diff.count || 0;
          }
          return acc;
        },
        { added: 0, removed: 0, noChange: 0 },
      );
      return (
        counts.noChange /
          (Math.abs(counts.added - counts.removed) + counts.noChange) >
        0.2
      );
    },
  });
};

export const PromptDiff = () => {
  const projectId = useProjectIdFromURL();
  const promptName = decodeURIComponent(useRouter().query.promptName as string);

  const versionQuery = useRouter().query.versions;
  const [leftVersion, rightVersion] = useMemo(() => {
    const versions = versionQuery as string;
    const [left, right] = "1...2".split("...");
    return [left, right];
  }, [versionQuery]);

  const { data: leftPrompt } = api.prompts.byVersion.useQuery(
    {
      projectId: projectId as string,
      promptName,
      version: Number(leftVersion),
    },
    { enabled: Boolean(projectId) },
  );
  const { data: rightPrompt } = api.prompts.byVersion.useQuery(
    {
      projectId: projectId as string,
      promptName,
      version: Number(rightVersion),
    },
    { enabled: Boolean(projectId) },
  );

  if (leftPrompt?.type === "text") {
    leftPrompt.prompt;
  }

  return (
    <div>
      <div>
        <div>{JSON.stringify(res, null, 2)}</div>
      </div>
    </div>
  );
};
