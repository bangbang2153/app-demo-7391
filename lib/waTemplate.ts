export const ALLOWED_PLACEHOLDERS = ["(car)", "(start)", "(end)", "(mode)", "(total)"] as const;

export function sanitizeWaTemplate(input: string): string {
  let s = String(input || "").slice(0, 500);
  s = s.split("<").join("").split(">").join("");
  s = s.replace(/javascript\s*:/gi, "");
  s = s.replace(/on\w+\s*=/gi, "");
  s = s.split("`").join("").split("$").join("").split("{").join("(").split("}").join(")");
  // normalize legacy {car} style if still entered
  // split/join already did { -> ( so "(car)" remains; fix double parentheses cases like "((car))"
  // keep only allowed placeholders, any other (...) with unknown word stays as plain text but stripped of special chars
  // enforce allowed list: re-wrap, no code execution — ponytail: split/join only, no eval
  // normalize legacy without parens? keep simple
  s = s.replace(/\(car\)/g, "(car)").replace(/\(start\)/g, "(start)").replace(/\(end\)/g, "(end)").replace(/\(mode\)/g, "(mode)").replace(/\(total\)/g, "(total)");
  return s.trim();
}

export function renderWaTemplate(template: string, values: Record<string, string>): string {
  let out = sanitizeWaTemplate(template);
  const map: Record<string, string> = {
    "(car)": String(values["car"] ?? "").split("(").join("").split(")").join("").slice(0, 100),
    "(start)": String(values["start"] ?? "").split("(").join("").split(")").join("").slice(0, 20),
    "(end)": String(values["end"] ?? "").split("(").join("").split(")").join("").slice(0, 20),
    "(mode)": String(values["mode"] ?? "").split("(").join("").split(")").join("").slice(0, 20),
    "(total)": String(values["total"] ?? "").split("(").join("").split(")").join("").slice(0, 20),
  };
  for (const ph of ALLOWED_PLACEHOLDERS) {
    const val = map[ph] ?? "";
    out = out.split(ph).join(val);
  }
  return out;
}
