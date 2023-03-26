const source              = require("lcov-parse");
const { program }         = require('commander');
const { jsonToHTMLTable } = require('nested-json-to-table')

const parseLCOV = content => new Promise((resolve, reject) => {
  source(content, (error, data) => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  });
});

const calcPercent = (json) => {
  try {
    return parseFloat(json.hit / json.found).toFixed(2)
  } catch {
    return 0
  }
}

const buildSummary = (lcovJson) => {
  return lcovJson.map((json) => {
    filename  = json.file
    lines     = calcPercent(json.lines)
    functions = calcPercent(json.functions)
    branches  = calcPercent(json.branches)

    return { filename, lines, functions, branches }
  })
}

const calcDiff = (base, target, coverageTarget) => {
  const baseCoverage   = base?.[coverageTarget] ?? 0
  const targetCoverage = target?.[coverageTarget] ?? 0
  return parseFloat(targetCoverage - baseCoverage).toFixed(2)
}

const resultFormat = (filename, base, target) => {
  return {
    filename,
    lines: {
      base: base?.lines ?? 0,
      target: target?.lines ?? 0,
      diff: calcDiff(base, target, "lines")
    },
    branches: {
      base: base?.branches ?? 0,
      target: target?.branches ?? 0,
      diff: calcDiff(base, target, "branches")
    },
    functions: {
      base: base?.functions ?? 0,
      target: target?.functions ?? 0,
      diff: calcDiff(base, target, "functions")
    }
  }
}

const compareLcov = async (baseLcov, targetLcov) => {
  const baseLcovJson   = await parseLCOV(baseLcov)
  const targetLcovJson = await parseLCOV(targetLcov)

  const baseSummary   = buildSummary(baseLcovJson)
  const targetSummary = buildSummary(targetLcovJson)

  const filenames = Array.from(
    new Set(
      [
        baseSummary.map((s) => s.filename),
        targetSummary.map((s) => s.filename)
      ].flat()
    )
  )

  return filenames.map((filename) => {
    const base   = baseSummary.find((json) => json.filename === filename)
    const target = targetSummary.find((json) => json.filename === filename)
    return resultFormat(filename, base, target)
  })
}

const decorate = (res, coverageTarget) => {
  const diff = res[coverageTarget].diff
  const icon = diff < 0 ? "⚠️" : diff > 0 ? "✅" : ""
  res[coverageTarget].diff = diff.concat(icon)
}

const decorates = (res) => {
  decorate(res, "lines")
  decorate(res, "branches")
  decorate(res, "functions")
}

////////////
// Process
////////////

program
  .requiredOption("-b, --base <lcov>")
  .requiredOption("-t, --target <lcov>")
  .option("--lines")
  .option("--branches")
  .option("--functions")
  .option("--json")
  .option("--table")
  .option("--icon");

program.parse();
const options = program.opts();

(async ()=>{
  const result = await compareLcov(options.base, options.target)

  const { lines, branches, functions, icon } = options
  const formattedResult = result.map((res) => {
    if (icon) { decorates(res) }

    if (!lines)     { delete res.lines }
    if (!branches)  { delete res.branches }
    if (!functions) { delete res.functions }

    return res
  })

  if (options.json) {
    console.log(formattedResult)
  }

  if (options.table) {
    const tableHTML = jsonToHTMLTable(formattedResult)
    console.log(tableHTML)
  }
})();