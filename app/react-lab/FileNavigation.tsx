import { Button, Inline, Text } from "@kb.ui/react";
import { useRef, useState } from "react";

type Node = { id: string; name: string; parent: string | null; depth: number; folder: boolean };
function fileNodes(paths: string[], collapsed: Set<string>): Node[] {
  const all = new Map<string, Node>([
    ["$project", { id: "$project", name: "Project", parent: null, depth: 0, folder: true }],
  ]);
  for (const path of paths) {
    const parts = path.split("/");
    parts.forEach((name, index) => {
      const id = parts.slice(0, index + 1).join("/");
      all.set(id, {
        id,
        name,
        parent: index ? parts.slice(0, index).join("/") : "$project",
        depth: index + 1,
        folder: index < parts.length - 1,
      });
    });
  }
  const result: Node[] = [];
  function visit(id: string) {
    const node = all.get(id);
    if (!node) return;
    result.push(node);
    if (!collapsed.has(id))
      [...all.values()]
        .filter((item) => item.parent === id)
        .sort((a, b) => Number(b.folder) - Number(a.folder) || a.name.localeCompare(b.name))
        .forEach((item) => {
          visit(item.id);
        });
  }
  visit("$project");
  return result;
}

// kbui stopgap: File Tree (G21); owner approved temporary IDE navigation.
export function FileTree({
  paths,
  activeFile,
  onOpen,
  onCollapse,
}: {
  paths: string[];
  activeFile: string | null;
  onOpen: (path: string) => void;
  onCollapse: () => void;
}) {
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [focused, setFocused] = useState(activeFile ?? "$project");
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const nodes = fileNodes(paths, collapsed);
  function focus(id: string) {
    setFocused(id);
    refs.current.get(id)?.focus();
  }
  function toggle(id: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setFocused(id);
  }
  const focusId = nodes.some((node) => node.id === focused) ? focused : "$project";
  return (
    <div
      role="tree"
      aria-label="Project files"
      className="lab-file-tree"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onCollapse();
        }
      }}
    >
      {nodes.map((node, index) => (
        <Button
          key={node.id}
          ref={(element) => {
            if (element) refs.current.set(node.id, element);
            else refs.current.delete(node.id);
          }}
          variant="ghost"
          size="sm"
          role="treeitem"
          aria-label={node.folder ? node.name : node.id}
          aria-level={node.depth + 1}
          aria-expanded={node.folder ? !collapsed.has(node.id) : undefined}
          aria-selected={!node.folder && node.id === activeFile}
          tabIndex={node.id === focusId ? 0 : -1}
          style={{ paddingInlineStart: 8 + node.depth * 12 }}
          onFocus={() => setFocused(node.id)}
          onClick={() => (node.folder ? toggle(node.id) : onOpen(node.id))}
          onKeyDown={(event) => {
            if (
              ["ArrowDown", "ArrowUp", "Home", "End", "ArrowRight", "ArrowLeft"].includes(event.key)
            )
              event.preventDefault();
            if (event.key === "ArrowDown")
              focus(nodes[Math.min(index + 1, nodes.length - 1)]?.id ?? node.id);
            if (event.key === "ArrowUp") focus(nodes[Math.max(0, index - 1)]?.id ?? node.id);
            if (event.key === "Home") focus("$project");
            if (event.key === "End") focus(nodes[nodes.length - 1]?.id ?? node.id);
            if (event.key === "ArrowRight" && node.folder) {
              if (collapsed.has(node.id)) toggle(node.id);
              else if (nodes[index + 1]?.parent === node.id) focus(nodes[index + 1]?.id ?? node.id);
            }
            if (event.key === "ArrowLeft") {
              if (node.folder && !collapsed.has(node.id)) toggle(node.id);
              else if (node.parent) focus(node.parent);
            }
          }}
        >
          <span aria-hidden="true">{node.folder ? (collapsed.has(node.id) ? "▸" : "▾") : "◇"}</span>
          <Text as="span" size="sm">
            {node.name}
          </Text>
        </Button>
      ))}
    </div>
  );
}

// kbui stopgap: Tabs (G4); owner approved temporary open-file tabs.
export function FileTabs({
  paths,
  activeFile,
  onOpen,
  onClose,
}: {
  paths: string[];
  activeFile: string;
  onOpen: (path: string) => void;
  onClose: (path: string) => void;
}) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  function select(path: string | undefined) {
    if (path) {
      onOpen(path);
      refs.current.get(path)?.focus();
    }
  }
  return (
    <Inline className="lab-file-tabs" role="tablist" aria-label="Open files">
      {paths.map((path, index) => (
        <div
          key={path}
          className="lab-file-tab"
          role="presentation"
          data-active={activeFile === path}
        >
          <Button
            variant="ghost"
            size="sm"
            role="tab"
            id={`file-tab-${encodeURIComponent(path)}`}
            aria-controls="lab-file-editor"
            aria-selected={activeFile === path}
            tabIndex={activeFile === path ? 0 : -1}
            aria-label={path}
            ref={(element) => {
              if (element) refs.current.set(path, element);
              else refs.current.delete(path);
            }}
            onClick={() => onOpen(path)}
            onKeyDown={(event) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End", "Delete"].includes(event.key))
                event.preventDefault();
              if (event.key === "ArrowLeft")
                select(paths[(index - 1 + paths.length) % paths.length]);
              if (event.key === "ArrowRight") select(paths[(index + 1) % paths.length]);
              if (event.key === "Home") select(paths[0]);
              if (event.key === "End") select(paths[paths.length - 1]);
              if (event.key === "Delete") {
                onClose(path);
                const next = paths[index + 1] ?? paths[index - 1];
                if (next) refs.current.get(next)?.focus();
              }
            }}
          >
            {path.split("/").pop()}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            tabIndex={-1}
            aria-label={`Close ${path}`}
            onClick={() => {
              onClose(path);
              const next =
                activeFile === path ? (paths[index + 1] ?? paths[index - 1]) : activeFile;
              if (next) refs.current.get(next)?.focus();
            }}
          >
            ×
          </Button>
        </div>
      ))}
    </Inline>
  );
}
