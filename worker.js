// Web worker that runs real Python (Pyodide) to check student answers.
// Running in a worker keeps the page responsive and lets the page kill
// runaway code (e.g. 9**9**9) with a timeout.

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

const CHECKER = String.raw`
import ast, math, json, re

FUNC_HINTS = {
    "sqrt": "math.sqrt", "sin": "math.sin", "cos": "math.cos", "tan": "math.tan",
    "asin": "math.asin", "acos": "math.acos", "atan": "math.atan", "arctan": "math.atan",
    "arcsin": "math.asin", "arccos": "math.acos", "log": "math.log", "ln": "math.log",
    "log10": "math.log10", "log2": "math.log2", "exp": "math.exp", "pi": "math.pi",
    "e": "math.e", "floor": "math.floor", "ceil": "math.ceil", "factorial": "math.factorial",
    "comb": "math.comb", "choose": "math.comb", "prod": "math.prod", "hypot": "math.hypot",
    "atan2": "math.atan2", "cbrt": "math.cbrt", "fabs": "abs", "π": "math.pi",
}

class NoValue(Exception):
    pass

def _run(code, env):
    tree = ast.parse(code, mode="exec")
    if not tree.body:
        raise NoValue("Your answer is empty.")
    last = tree.body[-1]
    pre = ast.Module(body=tree.body[:-1], type_ignores=[])
    exec(compile(pre, "<answer>", "exec"), env)
    if isinstance(last, ast.Expr):
        return eval(compile(ast.Expression(last.value), "<answer>", "eval"), env)
    if isinstance(last, ast.Assign) and len(last.targets) == 1 and isinstance(last.targets[0], ast.Name):
        exec(compile(ast.Module(body=[last], type_ignores=[]), "<answer>", "exec"), env)
        return env[last.targets[0].id]
    raise NoValue("The last line of your answer should be an expression (something that has a value).")

def _fmt(v):
    if isinstance(v, bool):
        return repr(v)
    if isinstance(v, float):
        return repr(float(f"{v:.12g}"))
    if isinstance(v, complex):
        return f"({v.real:.6g}{v.imag:+.6g}j)"
    r = repr(v)
    return r if len(r) <= 80 else r[:77] + "..."

def _same(exp, got):
    if isinstance(exp, bool):
        if isinstance(got, bool):
            return got == exp, None
        return False, "The answer should be True or False. Use a comparison such as ==, <, or <=."
    if isinstance(got, bool):
        return False, "Your expression gave True/False, but the answer should be a number."
    if isinstance(got, complex):
        return False, "Your answer is a complex number. This usually happens when a negative number is raised to a fractional power."
    if isinstance(got, (list, tuple, set, dict)):
        return False, ("Your answer is a " + type(got).__name__ + ". In Python, [ ] makes a list and commas make a tuple. "
                       "Use parentheses ( ) only to group things.")
    if isinstance(got, str):
        return False, "Your answer is a string. Don't put the expression in quotes."
    if not isinstance(got, (int, float)):
        return False, "Your answer is a " + type(got).__name__ + ", but the answer should be a number."
    if isinstance(exp, float) and math.isnan(exp):
        return isinstance(got, float) and math.isnan(got), None
    return math.isclose(got, exp, rel_tol=1e-9, abs_tol=1e-9), None

def _structural_hints(code, tree, var_names):
    hints = []
    if tree is not None:
        for node in ast.walk(tree):
            if isinstance(node, ast.BinOp) and isinstance(node.op, ast.BitXor):
                hints.append("^ is bitwise XOR in Python, not a power. Use ** instead, for example x**2.")
                break
        for node in ast.walk(tree):
            if isinstance(node, ast.BinOp) and isinstance(node.op, ast.BitOr):
                hints.append("| means 'bitwise or' in Python. For absolute value, use abs( ... ).")
                break
        for node in ast.walk(tree):
            if isinstance(node, ast.List):
                hints.append("[ ] makes a list in Python. Use parentheses ( ) for grouping.")
                break
    return hints

def _syntax_hints(code):
    hints = []
    if re.search(r"(?<![\w.])\d+\s*[A-Za-z_(]", code.replace("**", "")) and not re.search(r"\d[eE][+-]?\d", code):
        hints.append("It looks like a number is right next to a variable or parenthesis, like 3x or 2(x+1). Python needs * for multiplication: 3*x, 2*(x+1).")
    if re.search(r"\)\s*[A-Za-z_(\d]", code) and not re.search(r"\)\s*(for|if|in|and|or|not|else)\b", code):
        hints.append("A ) followed directly by a value, like (a+b)(a-b), needs a * between them.")
    if "|" in code:
        hints.append("Python has no |x| notation for absolute value. Use abs(x).")
    if "{" in code or "}" in code:
        hints.append("Braces { } are not for grouping in Python. Use parentheses ( ).")
    if re.search(r"[²³√×÷≤≥≠π]", code):
        hints.append("Python needs plain-keyboard operators: ** for powers, math.sqrt for square roots, * and / for multiplying and dividing, <= >= != for comparisons, and math.pi for π.")
    if re.search(r"(?<![=!<>])=(?!=)", code) and not re.search(r"^\s*\w+\s*=", code, re.M):
        hints.append("A single = assigns a value. To test equality, use ==.")
    if code.count("(") != code.count(")"):
        hints.append(f"Your parentheses don't match: {code.count('(')} opening and {code.count(')')} closing.")
    if "!" in code.replace("!=", ""):
        hints.append("Python has no ! for factorial. Use math.factorial(n).")
    return hints

def _name_hint(name, var_names):
    if name in var_names:
        return None
    if name in FUNC_HINTS and FUNC_HINTS[name]:
        target = FUNC_HINTS[name]
        return f"Python doesn't know '{name}' by itself. Use {target}" + ("( ... )." if target not in ("math.pi", "math.e") else ".")
    if len(name) > 1 and all(ch in var_names for ch in name):
        return f"'{name}' is read as one variable name. To multiply, put * between the letters: {'*'.join(name)}."
    stripped = name.replace("_", "")
    if stripped in var_names:
        return f"This problem's variable is named '{stripped}'. Subscripts don't use an underscore here."
    return f"'{name}' isn't defined. The variables you can use are: {', '.join(sorted(var_names))}."

def check(student, ref, trials_json, var_names_json, int_vars_json, target=12):
    trials = json.loads(trials_json)
    var_names = set(json.loads(var_names_json))
    int_vars = set(json.loads(int_vars_json))
    student = student.strip()
    if not student:
        return json.dumps({"status": "error", "kind": "Empty", "message": "Type an expression first.", "hints": []})
    try:
        tree = ast.parse(student, mode="exec")
    except SyntaxError as e:
        msg = e.msg
        return json.dumps({"status": "error", "kind": "SyntaxError",
                           "message": f"Python couldn't read that ({msg}).",
                           "hints": _syntax_hints(student)})

    hints = _structural_hints(student, tree, var_names)
    tested = 0
    for raw in trials:
        vals = {k: (int(v) if k in int_vars else float(v)) for k, v in raw.items()}
        base = {"math": math}
        try:
            exp = _run(ref, dict(base, **vals))
        except Exception:
            continue
        try:
            got = _run(student, dict(base, **vals))
        except NoValue as e:
            return json.dumps({"status": "error", "kind": "NoValue", "message": str(e), "hints": hints})
        except NameError as e:
            name = getattr(e, "name", None) or ""
            h = _name_hint(name, var_names)
            return json.dumps({"status": "error", "kind": "NameError", "message": str(e),
                               "hints": ([h] if h else []) + hints})
        except TypeError as e:
            s = str(e)
            extra = []
            if "not callable" in s:
                extra.append("'... is not callable' means Python thinks you're calling a number like a function, as in 2(x+1) or (a+b)(a-b). Add a * before the parenthesis.")
            return json.dumps({"status": "error", "kind": "TypeError", "message": s, "hints": extra + hints,
                               "vars": {k: _fmt(v) for k, v in vals.items()}})
        except Exception as e:
            kind = type(e).__name__
            extra = []
            if isinstance(e, ValueError) and "math domain" in str(e):
                extra.append("A math function got a value outside its domain, such as sqrt of a negative or log of 0. Check your parentheses.")
            if isinstance(e, ZeroDivisionError):
                extra.append("Your expression divided by zero for these values, but the correct expression doesn't. Check the denominator and the start of any range().")
            return json.dumps({"status": "error", "kind": kind, "message": str(e), "hints": extra + hints,
                               "vars": {k: _fmt(v) for k, v in vals.items()}})
        ok, why = _same(exp, got)
        if not ok:
            return json.dumps({"status": "wrong", "vars": {k: _fmt(v) for k, v in vals.items()},
                               "expected": _fmt(exp), "got": _fmt(got),
                               "why": why, "hints": hints})
        tested += 1
        if tested >= target:
            break
    if tested == 0:
        return json.dumps({"status": "error", "kind": "Internal", "message": "Couldn't generate test values for this problem.", "hints": []})
    return json.dumps({"status": "correct", "tested": tested})
`;

let pyodide = null;
const ready = (async () => {
  pyodide = await loadPyodide();
  await pyodide.runPythonAsync(CHECKER);
  postMessage({ type: "ready" });
})().catch((err) => postMessage({ type: "fatal", message: String(err) }));

onmessage = async (ev) => {
  const { id, student, ref, trials, varNames, intVars } = ev.data;
  await ready;
  try {
    const check = pyodide.globals.get("check");
    const out = check(student, ref, JSON.stringify(trials), JSON.stringify(varNames), JSON.stringify(intVars));
    check.destroy();
    postMessage({ type: "result", id, result: JSON.parse(out) });
  } catch (err) {
    postMessage({ type: "result", id, result: { status: "error", kind: "Internal", message: String(err), hints: [] } });
  }
};
