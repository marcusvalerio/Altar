export function printIssues(issues) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  for (const i of errors) console.error(`  ✗ [${i.where}] ${i.message}`);
  for (const i of warnings) console.warn(`  ! [${i.where}] ${i.message}`);
  if (!issues.length) console.log("  ✓ nenhuma inconsistência encontrada");
  return { errors, warnings };
}
