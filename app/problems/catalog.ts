import { binarySearch } from "./binary-search";
import { islandCount } from "./island-count";
import type { Problem } from "./problem";
import { sortedPairSum } from "./sorted-pair-sum";

export const problems: Problem[] = [binarySearch, sortedPairSum, islandCount];

export const findProblem = (slug: string) => problems.find((p) => p.slug === slug);
