# math_to_python
A site to practice converting math problems to Python.

**Live site:** https://irawoodring.github.io/math_to_python/

Students see a math expression (rendered with KaTeX) and type the equivalent Python.
Answers are checked by running real Python in the browser ([Pyodide](https://pyodide.org)):
the student's code and a reference answer are evaluated on random test values, so any
equivalent expression is accepted (`n*(n+1)//2` passes for `sum(range(1, n+1))`).

When an answer is wrong the site shows a concrete counterexample, and it recognizes common
mistakes such as `^` for powers, implicit multiplication (`3x`, `2(x+1)`), `sqrt` without
`math.`, `|x|` for absolute value, and `=` vs `==`.

## Files
- `index.html`, `style.css`, `app.js` — the page
- `problems.js` — the problem bank (edit this to add problems)
- `worker.js` — web worker that loads Pyodide and checks answers

## Adding a problem
Add an entry to `PROBLEMS` in `problems.js`:

```js
{
  id: "r11", cat: "formulas", level: 2, title: "Area of a trapezoid",
  tex: "\\frac{a + b}{2} h",
  vars: { a: [1, 10], b: [1, 10], h: [1, 10] },   // [min, max] or [min, max, "int"]
  py: "(a + b) / 2 * h",
  hint: "…", note: "…",
  // edges: [{ a: 1, b: 1, h: 1 }],  // optional fixed test cases
}
```

Pick variable ranges where the reference answer is defined (e.g. positive values under `sqrt`/`log`).

## Running locally
The worker needs to be served over HTTP:

```bash
python3 -m http.server 8000
```
