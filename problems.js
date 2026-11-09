// Problem bank.
// Each problem:
//   id      – stable identifier (used for saved progress)
//   cat     – category key (see CATEGORIES)
//   level   – 1 (warm-up) .. 3 (challenge)
//   title   – short description shown above the math
//   tex     – the math, as LaTeX
//   vars    – variable name -> [min, max, "int"?]  (random test values are drawn from this range)
//   edges   – optional list of specific test cases always checked first
//   py      – a reference Python answer (any equivalent answer is accepted)
//   hint    – nudge shown on request
//   note    – teaching point shown after solving

const CATEGORIES = {
  basics: "Arithmetic & order of operations",
  powers: "Exponents & roots",
  funcs: "The math module",
  intdiv: "Integer division & remainders",
  formulas: "Real formulas",
  sums: "Sums & products",
  logic: "Comparisons & logic",
};

const PROBLEMS = [
  // ---------- basics ----------
  {
    id: "b1", cat: "basics", level: 1, title: "A linear expression",
    tex: "3x + 2", vars: { x: [-10, 10] }, py: "3*x + 2",
    hint: "Python never multiplies implicitly. Write the * between 3 and x.",
    note: "In math, 3x means 3 times x. Python needs the * every time.",
  },
  {
    id: "b2", cat: "basics", level: 1, title: "Distribute",
    tex: "2(x - 1)", vars: { x: [-10, 10] }, py: "2*(x - 1)",
    hint: "2(x - 1) in Python means 'call 2 like a function'. Put a * before the parenthesis.",
    note: "Writing 2(x - 1) gives TypeError: 'int' object is not callable. That error almost always means a * is missing.",
  },
  {
    id: "b3", cat: "basics", level: 1, title: "Average of two numbers",
    tex: "\\frac{a + b}{2}", vars: { a: [-20, 20], b: [-20, 20] }, py: "(a + b) / 2",
    hint: "The fraction bar groups the whole top. In Python, put parentheses around a + b.",
    note: "a + b / 2 means a + (b / 2), because division happens before addition. A fraction bar acts like parentheses.",
  },
  {
    id: "b4", cat: "basics", level: 1, title: "Divide by a sum",
    tex: "\\frac{a}{b + c}", vars: { a: [-20, 20], b: [1, 10], c: [1, 10] }, py: "a / (b + c)",
    hint: "The whole bottom of the fraction needs parentheses.",
    note: "a / b + c means (a / b) + c. Put parentheses around a denominator that has more than one term.",
  },
  {
    id: "b5", cat: "basics", level: 1, title: "Products of variables",
    tex: "ab - cd", vars: { a: [-9, 9], b: [-9, 9], c: [-9, 9], d: [-9, 9] }, py: "a*b - c*d",
    hint: "ab is a variable named 'ab' in Python. You need a*b.",
    note: "Variable names in Python can be more than one letter, so ab is one name, not a times b.",
  },
  {
    id: "b6", cat: "basics", level: 2, title: "A ratio",
    tex: "\\frac{x + 1}{x - 1}", vars: { x: [2, 10] }, py: "(x + 1) / (x - 1)",
    hint: "Both the top and the bottom need their own parentheses.",
    note: "Check: (x + 1) / (x - 1). Leaving off either pair changes the result.",
  },
  {
    id: "b7", cat: "basics", level: 2, title: "Divide by a product",
    tex: "\\frac{x}{2y}", vars: { x: [-20, 20], y: [1, 10] }, py: "x / (2*y)",
    hint: "x / 2*y means (x / 2) * y. Group the denominator.",
    note: "* and / have equal precedence and run left to right, so x / 2*y is (x/2)*y, not x/(2y).",
  },
  {
    id: "b8", cat: "basics", level: 2, title: "Sum of two fractions",
    tex: "\\frac{a}{b} + \\frac{c}{d}", vars: { a: [-9, 9], b: [1, 9], c: [-9, 9], d: [1, 9] }, py: "a/b + c/d",
    hint: "Each fraction is a division. Division happens before addition.",
    note: "You don't need extra parentheses here because / runs before +. (a/b) + (c/d) is also fine.",
  },
  {
    id: "b9", cat: "basics", level: 3, title: "Harmonic combination",
    tex: "\\dfrac{1}{\\dfrac{1}{a} + \\dfrac{1}{b}}", vars: { a: [1, 10], b: [1, 10] }, py: "1 / (1/a + 1/b)",
    hint: "Work from the inside out. The denominator is 1/a + 1/b, so it needs parentheses.",
    note: "With nested fractions, write the inner pieces first, then wrap the whole denominator in parentheses.",
  },
  {
    id: "b10", cat: "basics", level: 2, title: "Vertex of a parabola",
    tex: "-\\frac{b}{2a}", vars: { a: [1, 5], b: [-10, 10] }, py: "-b / (2*a)",
    hint: "-b/2*a is (-b/2)*a. You need parentheses around 2*a.",
    note: "Another common mistake: -b / 2*a. Parentheses around the denominator fix it.",
  },

  // ---------- powers ----------
  {
    id: "p1", cat: "powers", level: 1, title: "Squaring",
    tex: "x^2", vars: { x: [-10, 10] }, py: "x**2",
    hint: "Python's exponent operator is **, not ^.",
    note: "In Python, ^ is bitwise XOR. 3^2 is 1, not 9. Always use ** for powers.",
  },
  {
    id: "p2", cat: "powers", level: 1, title: "A polynomial",
    tex: "x^3 + 2x^2 - 5", vars: { x: [-5, 5] }, py: "x**3 + 2*x**2 - 5",
    hint: "Use ** for each power and * between 2 and x**2.",
    note: "** comes before *, so 2*x**2 means 2*(x**2), the same as in math.",
  },
  {
    id: "p3", cat: "powers", level: 1, title: "Exponent with a sum",
    tex: "2^{n+1}", vars: { n: [0, 20, "int"] }, py: "2**(n + 1)",
    hint: "The whole exponent n + 1 needs parentheses.",
    note: "2**n + 1 means (2**n) + 1. In LaTeX, braces { } group the exponent. In Python you use parentheses.",
  },
  {
    id: "p4", cat: "powers", level: 2, title: "Negative of a square",
    tex: "-x^2", vars: { x: [-10, 10] }, py: "-x**2",
    hint: "Think about what gets squared: x, or -x?",
    note: "Python evaluates -x**2 as -(x**2), the same as math. (-x)**2 would be a different value.",
  },
  {
    id: "p5", cat: "powers", level: 1, title: "Square root",
    tex: "\\sqrt{x}", vars: { x: [0, 100] }, py: "math.sqrt(x)",
    hint: "Use math.sqrt(x). You could also write x**0.5.",
    note: "math.sqrt(x) and x**0.5 both work. math.sqrt raises an error for negative x, which can help you find bugs.",
  },
  {
    id: "p6", cat: "powers", level: 2, title: "Length of a vector",
    tex: "\\sqrt{a^2 + b^2}", vars: { a: [-10, 10], b: [-10, 10] }, py: "math.sqrt(a**2 + b**2)",
    hint: "Everything under the radical goes inside math.sqrt( ... ).",
    note: "math.hypot(a, b) computes the same value.",
  },
  {
    id: "p7", cat: "powers", level: 2, title: "Cube root",
    tex: "\\sqrt[3]{x}", vars: { x: [0.1, 100] }, py: "x**(1/3)",
    hint: "A cube root is the 1/3 power. Put parentheses around 1/3.",
    note: "x**1/3 means (x**1)/3. You need x**(1/3). Python 3.11+ also has math.cbrt(x).",
  },
  {
    id: "p8", cat: "powers", level: 2, title: "Reciprocal of a square",
    tex: "\\frac{1}{x^2}", vars: { x: [1, 10] }, py: "1 / x**2",
    hint: "** runs before /, so you don't need parentheses here.",
    note: "1 / x**2 and x**-2 are the same value.",
  },
  {
    id: "p9", cat: "powers", level: 2, title: "Fractional exponent",
    tex: "x^{\\frac{2}{3}}", vars: { x: [0.1, 50] }, py: "x**(2/3)",
    hint: "The exponent is 2/3. Group it with parentheses.",
    note: "x**2/3 is (x**2)/3. Always put parentheses around a fractional exponent.",
  },
  {
    id: "p10", cat: "powers", level: 1, title: "Natural exponential",
    tex: "e^{x}", vars: { x: [-5, 5] }, py: "math.exp(x)",
    hint: "Use math.exp(x). You could also write math.e**x.",
    note: "math.exp(x) is the usual way to write e to the x. It is a bit more accurate than math.e**x.",
  },
  {
    id: "p11", cat: "powers", level: 3, title: "Gaussian bump",
    tex: "e^{-x^2/2}", vars: { x: [-3, 3] }, py: "math.exp(-x**2 / 2)",
    hint: "The whole exponent -x²/2 goes inside math.exp( ... ).",
    note: "-x**2 / 2 is (-(x**2))/2, which matches the math.",
  },
  {
    id: "p12", cat: "powers", level: 3, title: "Tower of exponents",
    tex: "a^{b^c}", vars: { a: [1, 2], b: [1, 2], c: [1, 2] }, py: "a**b**c",
    hint: "Which exponent runs first? In math, b^c is done first.",
    note: "** groups right to left: a**b**c is a**(b**c), the same as math. (a**b)**c is a different value.",
  },

  // ---------- funcs ----------
  {
    id: "f1", cat: "funcs", level: 1, title: "Absolute value",
    tex: "|x - y|", vars: { x: [-10, 10], y: [-10, 10] }, py: "abs(x - y)",
    hint: "Absolute value is the built-in function abs( ... ).",
    note: "abs() is built in, so you don't need the math module. | means 'bitwise or' in Python.",
  },
  {
    id: "f2", cat: "funcs", level: 1, title: "Natural log",
    tex: "\\ln(x)", vars: { x: [0.1, 100] }, py: "math.log(x)",
    hint: "In Python, math.log(x) is the natural log, ln.",
    note: "math.log(x) is ln(x). math.log(x, b) gives the log in base b.",
  },
  {
    id: "f3", cat: "funcs", level: 1, title: "Common log",
    tex: "\\log_{10}(x)", vars: { x: [0.1, 1000] }, py: "math.log10(x)",
    hint: "There's a dedicated function: math.log10.",
    note: "math.log10(x) is the base 10 log. math.log(x, 10) also works but is slightly less precise.",
  },
  {
    id: "f4", cat: "funcs", level: 2, title: "Log base 2",
    tex: "\\log_2(n)", vars: { n: [1, 1000, "int"] }, py: "math.log2(n)",
    hint: "math.log2(n), or math.log(n, 2).",
    note: "Base 2 logs are common in computer science. Binary search takes about log₂(n) steps.",
  },
  {
    id: "f5", cat: "funcs", level: 1, title: "Area of a circle",
    tex: "\\pi r^2", vars: { r: [0, 10] }, py: "math.pi * r**2",
    hint: "π is math.pi.",
    note: "math.pi is π to about 15 digits. Don't type 3.14 yourself.",
  },
  {
    id: "f6", cat: "funcs", level: 1, title: "Trig sum",
    tex: "\\sin(x) + \\cos(x)", vars: { x: [-6, 6] }, py: "math.sin(x) + math.cos(x)",
    hint: "Use math.sin and math.cos. They take radians.",
    note: "Python's trig functions use radians. Convert degrees with math.radians(deg).",
  },
  {
    id: "f7", cat: "funcs", level: 2, title: "Squared sine",
    tex: "\\sin^2(\\theta)", vars: { theta: [-6, 6] }, py: "math.sin(theta)**2",
    hint: "sin²θ means (sin θ)². Square the result of math.sin.",
    note: "The notation sin²θ means (sin θ)². In Python, write math.sin(theta)**2.",
  },
  {
    id: "f8", cat: "funcs", level: 2, title: "Double angle",
    tex: "\\sin(2x)", vars: { x: [-6, 6] }, py: "math.sin(2*x)",
    hint: "The argument is 2*x.",
    note: "math.sin(2*x) is not the same as 2*math.sin(x).",
  },
  {
    id: "f9", cat: "funcs", level: 2, title: "Inverse tangent",
    tex: "\\tan^{-1}\\!\\left(\\frac{y}{x}\\right)", vars: { x: [1, 10], y: [-10, 10] }, py: "math.atan(y / x)",
    hint: "tan⁻¹ is arctangent: math.atan.",
    note: "Here tan⁻¹ means the inverse function, not 1/tan. math.atan2(y, x) also handles every quadrant.",
  },
  {
    id: "f10", cat: "funcs", level: 1, title: "Factorial",
    tex: "n!", vars: { n: [0, 12, "int"] }, py: "math.factorial(n)",
    hint: "math.factorial(n).",
    note: "In Python, ! does not mean factorial. != means 'not equal'.",
  },
  {
    id: "f11", cat: "funcs", level: 1, title: "Floor",
    tex: "\\lfloor x \\rfloor", vars: { x: [-10, 10] }, py: "math.floor(x)",
    hint: "math.floor rounds down.",
    note: "int(x) rounds toward zero, which is different from floor for negative x. Try x = -2.5.",
  },
  {
    id: "f12", cat: "funcs", level: 2, title: "Ceiling of a quotient",
    tex: "\\left\\lceil \\frac{n}{k} \\right\\rceil", vars: { n: [1, 50, "int"], k: [1, 9, "int"] }, py: "math.ceil(n / k)",
    hint: "math.ceil rounds up.",
    note: "A trick using only integers: -(-n // k) gives the same answer.",
  },
  {
    id: "f13", cat: "funcs", level: 2, title: "Binomial coefficient",
    tex: "\\binom{n}{k}", vars: { n: [5, 15, "int"], k: [0, 5, "int"] }, py: "math.comb(n, k)",
    hint: "'n choose k' is math.comb(n, k).",
    note: "math.comb(n, k) is exact. You could also write math.factorial(n) // (math.factorial(k) * math.factorial(n - k)).",
  },

  // ---------- intdiv ----------
  {
    id: "i1", cat: "intdiv", level: 1, title: "Floor division",
    tex: "\\left\\lfloor \\frac{a}{b} \\right\\rfloor", vars: { a: [-50, 50, "int"], b: [1, 9, "int"] }, py: "a // b",
    hint: "Python has an operator just for this: //.",
    note: "// rounds down, toward negative infinity: -7 // 2 is -4. int(a / b) would give -3.",
  },
  {
    id: "i2", cat: "intdiv", level: 1, title: "Remainder",
    tex: "a \\bmod b", vars: { a: [0, 100, "int"], b: [2, 9, "int"] }, py: "a % b",
    hint: "The modulo operator is %.",
    note: "% gives the remainder. a == b*(a // b) + a % b is always True.",
  },
  {
    id: "i3", cat: "intdiv", level: 2, title: "Last digit",
    tex: "n \\bmod 10", vars: { n: [0, 99999, "int"] }, py: "n % 10",
    hint: "The remainder after dividing by 10 is the last digit.",
    note: "n % 10 gives the last digit and n // 10 removes it. You'll use both a lot.",
  },
  {
    id: "i4", cat: "intdiv", level: 2, title: "Minutes to hours",
    tex: "\\left\\lfloor \\frac{m}{60} \\right\\rfloor", vars: { m: [0, 1000, "int"] }, py: "m // 60",
    hint: "Whole hours means floor division.",
    note: "m // 60 gives the hours and m % 60 gives the minutes left over. divmod(m, 60) returns both.",
  },

  // ---------- formulas ----------
  {
    id: "r1", cat: "formulas", level: 1, title: "Celsius to Fahrenheit",
    tex: "\\frac{9}{5}C + 32", vars: { C: [-40, 100] }, py: "9/5*C + 32",
    hint: "9/5*C works because / and * go left to right.",
    note: "9/5*C means (9/5)*C. 9*C/5 + 32 gives the same value.",
  },
  {
    id: "r2", cat: "formulas", level: 1, title: "Mean of three values",
    tex: "\\frac{a + b + c}{3}", vars: { a: [-20, 20], b: [-20, 20], c: [-20, 20] }, py: "(a + b + c) / 3",
    hint: "Put the whole numerator in parentheses.",
    note: "a + b + c / 3 only divides c by 3.",
  },
  {
    id: "r3", cat: "formulas", level: 1, title: "Kinetic energy",
    tex: "\\frac{1}{2} m v^2", vars: { m: [0, 100], v: [-30, 30] }, py: "0.5 * m * v**2",
    hint: "1/2 can be written 1/2 or 0.5. Square only v.",
    note: "(m*v)**2 squares m too. Make sure you square only v.",
  },
  {
    id: "r4", cat: "formulas", level: 2, title: "Volume of a sphere",
    tex: "\\frac{4}{3}\\pi r^3", vars: { r: [0, 10] }, py: "4/3 * math.pi * r**3",
    hint: "4/3 * math.pi * r**3.",
    note: "In Python 3, 4/3 is 1.333…, not 1, so this works. In some other languages 4/3 rounds down to 1.",
  },
  {
    id: "r5", cat: "formulas", level: 2, title: "Slope between two points",
    tex: "\\frac{y_2 - y_1}{x_2 - x_1}", vars: { x1: [0, 5], x2: [6, 10], y1: [-10, 10], y2: [-10, 10] }, py: "(y2 - y1) / (x2 - x1)",
    hint: "Subscripts become part of the name: y₂ is y2. Both differences need parentheses.",
    note: "Subscripted variables like x₁ are usually named x1 in code.",
  },
  {
    id: "r6", cat: "formulas", level: 2, title: "Distance formula",
    tex: "\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}", vars: { x1: [-10, 10], x2: [-10, 10], y1: [-10, 10], y2: [-10, 10] }, py: "math.sqrt((x2 - x1)**2 + (y2 - y1)**2)",
    hint: "Name the subscripts x1, x2, y1, y2. Everything under the radical goes in math.sqrt( ... ).",
    note: "math.dist((x1, y1), (x2, y2)) computes the same thing.",
  },
  {
    id: "r7", cat: "formulas", level: 3, title: "Quadratic formula (+ root)",
    tex: "\\frac{-b + \\sqrt{b^2 - 4ac}}{2a}", vars: { a: [1, 3], b: [-5, 5], c: [-5, -1] }, py: "(-b + math.sqrt(b**2 - 4*a*c)) / (2*a)",
    hint: "Three groups: the numerator, the expression inside sqrt, and the denominator 2*a.",
    note: "The most common bug here is / 2*a, which multiplies by a instead of dividing by it.",
  },
  {
    id: "r8", cat: "formulas", level: 3, title: "Compound interest",
    tex: "P\\left(1 + \\frac{r}{n}\\right)^{nt}", vars: { P: [100, 5000], r: [0.01, 0.1], n: [1, 12, "int"], t: [1, 30, "int"] }, py: "P * (1 + r/n)**(n*t)",
    hint: "The exponent n·t needs parentheses, and you need a * after P.",
    note: "**n*t would mean (… ** n) * t. Put parentheses around a compound exponent.",
  },
  {
    id: "r9", cat: "formulas", level: 3, title: "Law of cosines",
    tex: "\\sqrt{a^2 + b^2 - 2ab\\cos(C)}", vars: { a: [1, 10], b: [1, 10], C: [0.1, 3] }, py: "math.sqrt(a**2 + b**2 - 2*a*b*math.cos(C))",
    hint: "2ab cos C is 2*a*b*math.cos(C).",
    note: "Count the * signs. You need one between every pair of factors.",
  },
  {
    id: "r10", cat: "formulas", level: 3, title: "Normal distribution density",
    tex: "\\frac{1}{\\sigma\\sqrt{2\\pi}}\\, e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}", vars: { x: [-3, 3], mu: [-1, 1], sigma: [0.5, 2] }, py: "1 / (sigma * math.sqrt(2*math.pi)) * math.exp(-(x - mu)**2 / (2*sigma**2))",
    hint: "Name Greek letters with words: sigma, mu. Build it in two parts: the fraction in front, then math.exp( ... ).",
    note: "For long formulas, build it in pieces. You can use several lines, e.g. coef = ...  then  coef * math.exp(...).",
  },

  // ---------- sums ----------
  {
    id: "s1", cat: "sums", level: 2, title: "Sum of the first n integers",
    tex: "\\sum_{i=1}^{n} i", vars: { n: [1, 50, "int"] }, py: "sum(range(1, n + 1))",
    hint: "range(1, n + 1) gives 1, 2, …, n. Wrap it in sum( ... ).",
    note: "range stops before its end value, so the upper limit n becomes n + 1. Gauss's formula n*(n + 1)//2 also works.",
  },
  {
    id: "s2", cat: "sums", level: 2, title: "Sum of squares",
    tex: "\\sum_{i=1}^{n} i^2", vars: { n: [1, 50, "int"] }, py: "sum(i**2 for i in range(1, n + 1))",
    hint: "Use a generator: sum(<term> for i in range(...)).",
    note: "sum(term for i in range(a, b + 1)) is the Python version of Σ from a to b.",
  },
  {
    id: "s3", cat: "sums", level: 2, title: "Sum of odd numbers",
    tex: "\\sum_{i=1}^{n} (2i - 1)", vars: { n: [1, 50, "int"] }, py: "sum(2*i - 1 for i in range(1, n + 1))",
    hint: "The term is 2*i - 1.",
    note: "This sum always equals n**2. Try a few values of n to check.",
  },
  {
    id: "s4", cat: "sums", level: 2, title: "Powers of two",
    tex: "\\sum_{k=0}^{n} 2^k", vars: { n: [0, 30, "int"] }, py: "sum(2**k for k in range(n + 1))",
    hint: "This sum starts at k = 0, so range(n + 1) works.",
    note: "range(n + 1) runs from 0 to n. The closed form is 2**(n + 1) - 1.",
  },
  {
    id: "s5", cat: "sums", level: 3, title: "Harmonic number",
    tex: "\\sum_{i=1}^{n} \\frac{1}{i}", vars: { n: [1, 100, "int"] }, py: "sum(1/i for i in range(1, n + 1))",
    hint: "Start at 1, not 0. Dividing by zero raises an error.",
    note: "If you start range at 0, you get a ZeroDivisionError.",
  },
  {
    id: "s6", cat: "sums", level: 3, title: "Product notation",
    tex: "\\prod_{i=1}^{n} i", vars: { n: [0, 15, "int"] }, py: "math.prod(range(1, n + 1))",
    hint: "math.prod works like sum, but multiplies.",
    note: "This is n!. math.prod of an empty range is 1, which matches 0! = 1.",
  },
  {
    id: "s7", cat: "sums", level: 3, title: "Sum with a variable term",
    tex: "\\sum_{i=1}^{n} x^i", vars: { n: [1, 10, "int"], x: [-2, 2] }, py: "sum(x**i for i in range(1, n + 1))",
    hint: "The loop variable is i. x stays the same each time.",
    note: "Variables from outside the sum, like x, can be used inside the generator.",
  },

  // ---------- logic ----------
  {
    id: "l1", cat: "logic", level: 1, title: "Not equal",
    tex: "x \\neq y", vars: { x: [0, 2, "int"], y: [0, 2, "int"] }, py: "x != y",
    edges: [{ x: 1, y: 1 }, { x: 0, y: 2 }],
    hint: "Python uses != for 'not equal'.",
    note: "== tests if two values are equal and != tests if they are different. A single = assigns a value.",
  },
  {
    id: "l2", cat: "logic", level: 1, title: "Even number test",
    tex: "n \\bmod 2 = 0", vars: { n: [0, 100, "int"] }, py: "n % 2 == 0",
    hint: "Equality is == in Python. A single = assigns a value.",
    note: "n % 2 == 0 is the standard way to check if a number is even.",
  },
  {
    id: "l3", cat: "logic", level: 2, title: "A range check",
    tex: "0 \\le x < 10", vars: { x: [-5, 15] }, py: "0 <= x < 10",
    hint: "Python lets you chain comparisons the same way math does.",
    note: "0 <= x < 10 works directly in Python. Many other languages need 0 <= x and x < 10.",
  },
  {
    id: "l4", cat: "logic", level: 2, title: "Both positive",
    tex: "x > 0 \\;\\land\\; y > 0", vars: { x: [-5, 5], y: [-5, 5] }, py: "x > 0 and y > 0",
    hint: "∧ means 'and'. Python uses the word and.",
    note: "Python writes ∧, ∨, ¬ as the words and, or, not.",
  },
  {
    id: "l5", cat: "logic", level: 2, title: "Outside an interval",
    tex: "x < -1 \\;\\lor\\; x > 1", vars: { x: [-3, 3] }, py: "x < -1 or x > 1",
    hint: "∨ means 'or'.",
    note: "abs(x) > 1 is an equivalent way to write this.",
  },
  {
    id: "l6", cat: "logic", level: 2, title: "Close to a target",
    tex: "|x - 5| \\le 2", vars: { x: [0, 10] }, py: "abs(x - 5) <= 2",
    hint: "≤ is written <= in Python.",
    note: "abs(a - b) <= tolerance is how you check that two floats are close. math.isclose does this too.",
  },
  {
    id: "l7", cat: "logic", level: 3, title: "Leap year rule",
    tex: "(y \\bmod 4 = 0 \\land y \\bmod 100 \\neq 0) \\lor y \\bmod 400 = 0", vars: { y: [1800, 2400, "int"] }, py: "(y % 4 == 0 and y % 100 != 0) or y % 400 == 0",
    edges: [{ y: 1900 }, { y: 2000 }, { y: 2100 }, { y: 2024 }, { y: 2023 }],
    hint: "Translate each piece: mod → %, = → ==, ≠ → !=, ∧ → and, ∨ → or.",
    note: "and runs before or, but the parentheses make the meaning clear to anyone reading it.",
  },
];
