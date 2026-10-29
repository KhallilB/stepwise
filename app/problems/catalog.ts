import { binarySearch } from "./binary-search";
import type { Problem } from "./problem";

export const problems: Problem[] = [binarySearch];

export const findProblem = (slug: string) => problems.find((p) => p.slug === slug);
