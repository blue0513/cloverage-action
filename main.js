const source              = require("lcov-parse");
const { program }         = require('commander');
const { jsonToHTMLTable } = require('nested-json-to-table');
const lcovTotal           = require('lcov-total');

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

const decorateStr = (str) => {
  const icon = str < 0 ? "⚠️" : str > 0 ? "✅" : ""
  return str.concat(icon)
}

const decorates = (res) => {
  res.lines.diff     = decorateStr(res.lines.diff)
  res.branches.diff  = decorateStr(res.branches.diff)
  res.functions.diff = decorateStr(res.functions.diff)
}

const showOutput = (summaryJson, outputOption) => {
  if (outputOption === "json") {
    console.log(summaryJson)
  }

  if (outputOption === "table") {
    console.log(jsonToHTMLTable(summaryJson))
  }
}

const showSummary = (base, target, iconOption, outputOption) => {
  const baseSummary   = lcovTotal(base)
  const targetSummary = lcovTotal(target)
  const rawDiff        = (targetSummary - baseSummary).toFixed(2)
  const totalJson = {
    baseSummary,
    targetSummary,
    diff: iconOption ? decorateStr(rawDiff) : rawDiff
  }

  showOutput([totalJson], outputOption)
}

////////////
// Process
////////////

program
  .description('Compare two lcov file and show coverage diff')
  .requiredOption("-b, --base <lcov>", "[required] base lcov file")
  .requiredOption("-t, --target <lcov>", "[required] target lcov file")
  .requiredOption("-o, --outputFormat <outputFormat>", "[required] json | table")
  .requiredOption("-c, --coverageTypes [coverageTypes...]", "[required] line | branch | function")
  .option("--onlySummary", "show only summary")
  .option("--icon", "decorate output")

program.parse();
const options = program.opts();

(async ()=>{
  const result = await compareLcov(options.base, options.target)

  const { outputFormat, coverageTypes, icon } = options
  const formattedResult = result.map((res) => {
    if (icon) { decorates(res) }

    if (!coverageTypes.includes("line"))      { delete res.lines }
    if (!coverageTypes.includes("branch"))    { delete res.branches }
    if (!coverageTypes.includes("functions")) { delete res.functions }

    return res
  })

  if (options.onlySummary) {
    showSummary(options.base, options.target, icon, outputFormat)
    return
  }

  showOutput(formattedResult, outputFormat)
})();
