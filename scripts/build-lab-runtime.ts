const result = await Bun.build({
  entrypoints: ["app/react-lab/runtime.tsx"],
  target: "browser",
  format: "iife",
  minify: true,
  outdir: "public",
  naming: "react-lab-runtime.js",
  plugins: [
    {
      name: "inline-css-text",
      setup(builder) {
        builder.onResolve({ filter: /\.css\?raw$/ }, (args) => ({
          path: Bun.resolveSync(args.path.slice(0, -4), args.resolveDir),
          namespace: "css-text",
        }));
        builder.onLoad({ filter: /.*/, namespace: "css-text" }, async (args) => ({
          contents: await Bun.file(args.path).text(),
          loader: "text",
        }));
      },
    },
  ],
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log(`React lab runtime: ${Math.round((result.outputs[0]?.size ?? 0) / 1024)} KB`);
