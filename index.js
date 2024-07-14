const setup = () => {
  // ---------- 変更するElementの取得 ----------

  const formulaInputErrorElement = document.getElementById(
    "formula-input-error"
  )
  const stepElement = document.getElementById("step")
  const graph = new VCanvas(document.getElementById("graph"))
  const graphBackground = new VCanvas(
    document.getElementById("graph-background")
  )

  const bisectResultM = document.getElementById("bisect-result-m")
  const bisectResultA = document.getElementById("bisect-result-a")
  const bisectResultB = document.getElementById("bisect-result-b")
  const bisectResultF = document.getElementById("bisect-result-f")
  const bisectResultSymbol = document.getElementById("bisect-result-symbol")
  const bisectResultChange = document.getElementById("bisect-result-change")
  const bisectResultMAfter = document.getElementById("bisect-result-m-after")
  const bisectResultDiff = document.getElementById("bisect-result-diff")

  const newtonResultXn1 = document.getElementById("newton-result-xn-1")
  const newtonResultXn = document.getElementById("newton-result-xn")
  const newtonResultF = document.getElementById("newton-result-f")
  const newtonResultFPrime = document.getElementById("newton-result-f-prime")
  const newtonResultDiff = document.getElementById("newton-result-diff")

  // ---------- 数値計算系処理 ----------

  let formula = ""

  const evalFormula = (x) => {
    try {
      const ans = math.evaluate(formula, { x: x })
      return ans
    } catch (e) {
      if (e instanceof SyntaxError) {
        formulaInputErrorElement.innerHTML = "Syntax Error"
      } else {
        formulaInputErrorElement.innerHTML = "Unknown Error"
      }
    }
  }

  const f_x = (x) => {
    return evalFormula(x)
  }

  const f_prime_x = (x) => {
    const h = 1e-6
    return (f_x(x + h) - f_x(x)) / h
  }

  const bisect = (a, b) => {
    const m = (a + b) / 2

    if (f_x(a) * f_x(m) < 0) {
      return { a: a, b: m }
    } else {
      return { a: m, b: b }
    }
  }

  const full_bisect = (a, b) => {
    for (let i = 0; i < 200; i++) {
      const ans = bisect(a, b)
      a = ans.a
      b = ans.b
    }
    return a
  }

  const newton = (x) => {
    return x - f_x(x) / f_prime_x(x)
  }

  const full_newton = (x) => {
    for (let i = 0; i < 100; i++) {
      x = newton(x)
    }
    return x
  }

  // ---------- 初期条件・初期化系 ----------

  let step = 0
  let answer = 0

  let bisectInit = { a: 1, b: 0 }
  let newtonInit = 0

  let bisectAnswer = { a: 1, b: 0 }
  let newtonAnswer = 0

  const reset = () => {
    step = 0
    stepElement.innerHTML = step

    bisectResultM.innerHTML = "0.000"
    bisectResultA.innerHTML = "0.000"
    bisectResultB.innerHTML = "0.000"
    bisectResultF.innerHTML = "0.000"
    bisectResultSymbol.innerHTML = "="
    bisectResultChange.innerHTML = "a"
    bisectResultMAfter.innerHTML = "0.000"
    bisectResultDiff.innerHTML = "0.000"

    newtonResultXn1.innerHTML = "0.000"
    newtonResultXn.innerHTML = "0.000"
    newtonResultF.innerHTML = "0.000"
    newtonResultFPrime.innerHTML = "0.000"
    newtonResultDiff.innerHTML = "0.000"

    bisectAnswer = { a: bisectInit.a, b: bisectInit.b }
    newtonAnswer = newtonInit

    answer = full_newton(newtonAnswer)
    if (math.abs(answer - full_bisect(bisectAnswer.a, bisectAnswer.b)) > 1e-6) {
      formulaInputErrorElement.innerHTML = "近似解が揃いません"
    }

    let max = math.max(bisectAnswer.a, bisectAnswer.b, newtonAnswer, answer)
    let min = math.min(bisectAnswer.a, bisectAnswer.b, newtonAnswer, answer)

    graph.cls()
    graph.scale(0, max, 20, min - max)

    graphBackground.cls()
    graphBackground.scale(-0.1, max, 20, min - max)
    graphBackground.color(0, 0, 0)
    graphBackground.beginPath()
    graphBackground.line(-0.1, answer, 20, answer)
    graphBackground.line(0, max, 0, min - max)
    graphBackground.stroke()
  }

  // ---------- イベントハンドラ登録 ----------

  document.getElementById("formula").oninput = (e) => {
    formulaInputErrorElement.innerHTML = "OK"
    formula = e.target.value
    try {
      // 数式が問題なく実行できるか確かめるため、-10から10までの値を代入してみる
      for (let i = -10; i < 10; i++) {
        evalFormula(i)
      }
    } catch (e) {
      return
    }
    reset()
  }
  document.getElementById("bisect-a").oninput = (e) => {
    bisectInit.a = Number(e.target.value)
    reset()
  }
  document.getElementById("bisect-b").oninput = (e) => {
    bisectInit.b = Number(e.target.value)
    reset()
  }
  document.getElementById("newton").oninput = (e) => {
    newtonInit = Number(e.target.value)
    reset()
  }

  document.getElementById("next").onclick = () => {
    if (step >= 20) {
      stepElement.innerHTML = "上限です"
      return
    }

    bisectResultA.innerHTML = bisectAnswer.a.toFixed(3)
    bisectResultB.innerHTML = bisectAnswer.b.toFixed(3)
    const m = (bisectAnswer.a + bisectAnswer.b) / 2
    bisectResultM.innerHTML = m.toFixed(3)
    bisectResultMAfter.innerHTML = m.toFixed(3)
    const f = f_x(bisectAnswer.a) * f_x(m)
    bisectResultF.innerHTML = f.toFixed(3)
    if (f < 0) {
      bisectResultSymbol.innerHTML = "<"
      bisectResultChange.innerHTML = "b"
    } else {
      bisectResultSymbol.innerHTML = ">"
      bisectResultChange.innerHTML = "a"
    }
    const oldA = bisectAnswer.a
    const { a, b } = bisect(bisectAnswer.a, bisectAnswer.b)
    bisectAnswer = { a: a, b: b }
    bisectResultDiff.innerHTML = (a - answer).toFixed(3)

    newtonResultXn1.innerHTML = newtonAnswer.toFixed(3)
    newtonResultF.innerHTML = f_x(newtonAnswer).toFixed(3)
    newtonResultFPrime.innerHTML = f_prime_x(newtonAnswer).toFixed(3)
    const oldNewtonAnswer = newtonAnswer
    newtonAnswer = newton(newtonAnswer)
    newtonResultXn.innerHTML = newtonAnswer.toFixed(3)
    newtonResultDiff.innerHTML = (newtonAnswer - answer).toFixed(3)

    graphBackground.beginPath()
    graphBackground.color(255, 0, 0)
    graphBackground.line(step, oldA, step + 1, a)
    graphBackground.stroke()

    graphBackground.beginPath()
    graphBackground.color(0, 0, 255)
    graphBackground.line(step, oldNewtonAnswer, step + 1, newtonAnswer)
    graphBackground.stroke()

    step++
    stepElement.innerHTML = step
  }
  document.getElementById("reset").onclick = () => {
    reset()
  }

  //  ---------- 画面の初期化 ----------

  reset()
}

window.addEventListener("load", setup)
