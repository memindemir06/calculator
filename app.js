// VARIABLES TO MANIPULATE DISPLAY SCREEN
const display = document.querySelector(".display");
const mainDisplay = display.lastElementChild;
const sideDisplay = display.firstElementChild;

// VARIABLES FOR CLICK EVENT
const buttons = document.querySelector(".calculator");

// GLOBAL VARIABLES FOR CALCULATIONS
let g_current = 0;
let g_buffer = [];
let g_infix = [];
let g_keys = [];

// EVENT LISTENERS

window.addEventListener("keydown", keyHandle);
buttons.addEventListener("click", clickHandle);

// FUNCTIONS

function keyHandle(event) {
  let key = event.key;
  // Select only numbers,operators,enter,backspace
  const reg = /^[\d\*\/\+\-\=\,\.]|Enter|Backspace$/;
  if (reg.test(key) === false) return;
  if (key === "Enter") key = "=";
  if (key === ",") key = ".";
  keysPush(key);
  calculator(key);
}

function clickHandle(event) {
  const target = event.target;
  const dataKey = target.getAttribute("data-key");
  let key;
  if (dataKey === "44") return;
  if (parseInt(dataKey) <= 57 && parseInt(dataKey) >= 42) {
    key = String.fromCharCode(dataKey);
  } else if (dataKey === "13") {
    key = "=";
  } else if (dataKey === "8") {
    key = "Backspace";
  } else {
    key = dataKey;
  }
  keysPush(key);
  calculator(key);
}

function calculator(key) {
  if (parseInt(key) >= 0 && parseInt(key) <= 9) {
    if (g_keys.length < 2 || !checkNum(g_keys[0])) resetMain();
    if (checkOther()) resetSide();
    displayM(key);
    bufferPush(parseFloat(key));
  }
  //
  else if (key === "," || key === ".") {
    displayM(key);
    bufferPush(key);
  }
  //
  else if (key === "/" || key === "*" || key === "+" || key === "-") {
    if (g_buffer.length) {
      g_current = parseFloat(g_buffer.join(""));
      resetBuffer();
    }
    if (g_keys[0] === "=") resetSide();
    console.log("as", g_infix);
    if (checkOperator(g_keys[0])) {
      g_infix[g_infix.length - 1] = key;
      const arr = sideDisplay.innerText.split("");
      arr.pop();
      arr.push(key);
      sideDisplay.innerText = arr.join("");
    } else {
      g_infix.push(g_current);
      g_infix.push(key);
      displayS(g_current, key);
    }
  }
  //
  else if (key === "=") {
    if (g_buffer.length) {
      g_current = parseFloat(g_buffer.join(""));
      resetBuffer();
    } else resetSide();
    g_infix.push(g_current);
    displayS(g_current, key);
    if (g_buffer.length === 0) resetMain();
    //console.log("in last: ", g_infix);
    const output = infixToPostfix(g_infix);
    //console.log(output);
    g_infix = [];
    const result = giveResult(output);
    //console.log(result);
    if (result === "Cannot divide with 0!") {
      g_current = 0;
      resetBuffer();
    } else {
      g_current = result;
    }
    displayM(result);
  } else {
    switch (key) {
      case "Backspace":
        if (g_buffer.length) {
          g_buffer.pop();
          const arr = mainDisplay.innerText.split("");
          arr.pop();
          mainDisplay.innerText = arr.length ? arr.join("") : "0";
        } else if (
          checkOperator(sideDisplay.innerText[sideDisplay.innerText.length - 1])
        )
          break;
        else resetSide();
        break;
      case "res":
        resetMain();
        resetSide();
        resetBuffer();
        g_infix = [];
        g_current = 0;
        displayM(0);
        break;
      case "sqrt":
        if (g_buffer.length) {
          g_current = parseFloat(g_buffer.join(""));
          resetBuffer();
        }
        resetMain();
        //resetSide();
        let sq =
          g_current >= 0 ? parseFloat(Math.sqrt(g_current).toFixed(13)) : 0;
        //displayS(sq);
        displayM(sq);
        g_current = sq;
        resetBuffer();
        break;
      case "pow":
        break;
      case "fac":
        if (g_buffer.length) {
          g_current = parseFloat(g_buffer.join(""));
          resetBuffer();
        }
        resetMain();
        //resetSide();
        let res = fac(g_current);
        //displayS(g_current, "!");
        displayM(res);
        g_current = res;
        resetBuffer();
        break;
      default:
        break;
    }
  }
  console.log(
    "Global Keys: ",
    g_keys,
    "\n",
    "Global Buffer: ",
    g_buffer,
    "\n",
    "Current Number: ",
    g_current,
    "\n",
    "infix: ",
    g_infix,
    "\n"
  );
}

function infixToPostfix(infix) {
  let stack = [];
  let output = [];
  for (let i = 0; i < infix.length; i++) {
    const el = infix[i];
    if (typeof el === "number") {
      output.push(el);
    } else {
      if (!stack.length) stack.push(el);
      else {
        while (stack.length && compare(el, stack[stack.length - 1])) {
          output.push(stack.pop());
        }
        stack.push(el);
      }
    }
  }
  while (stack.length) {
    output.push(stack.pop());
  }
  return output;
}

function compare(operator1, operator2) {
  if (operator1 === "+" || operator1 === "-") return true;
  else if (operator2 === "/" || operator2 === "*") return true;
  else return false;
}

function giveResult(output) {
  let stack = [];
  while (output.length) {
    const el = output.shift();
    if (typeof el === "number") stack.push(el);
    else {
      const operand1 = stack.pop();
      const operand2 = stack.pop();
      let res;
      switch (el) {
        case "*":
          res = parseFloat(operand2) * parseFloat(operand1);
          break;
        case "+":
          res = parseFloat(operand2) + parseFloat(operand1);
          break;
        case "-":
          res = parseFloat(operand2) - parseFloat(operand1);
          break;
        case "/":
          res =
            parseFloat(operand1) === 0
              ? "error"
              : parseFloat(operand2) / parseFloat(operand1);
          break;
        default:
          break;
      }
      if (typeof res === "number") stack.push(res);
      else return "Cannot divide with 0!";
    }
  }
  return stack.pop();
}

function checkNum(key) {
  if (
    key === "0" ||
    key === "1" ||
    key === "2" ||
    key === "3" ||
    key === "4" ||
    key === "5" ||
    key === "6" ||
    key === "7" ||
    key === "8" ||
    key === "9" ||
    key === "," ||
    key === "."
  ) {
    return true;
  } else return false;
}

function checkOther() {
  if (g_keys[0] === "=" || g_keys[0] === "sqrt" || g_keys[0] === "fac") {
    return true;
  } else return false;
}

function checkOperator(char) {
  return char === "*" || char === "/" || char === "+" || char === "-"
    ? true
    : false;
}

function keysPush(key) {
  g_keys.push(key);
  if (g_keys.length > 2) g_keys.shift();
}

function bufferPush(num) {
  g_buffer.push(num);
}

function resetMain() {
  mainDisplay.innerText = "";
}

function resetSide() {
  sideDisplay.innerText = "";
}

function resetBuffer() {
  g_buffer = [];
}

function displayM(number) {
  mainDisplay.innerText += number;
}

function displayS(...expressions) {
  expressions.forEach((expression) => {
    sideDisplay.innerText = sideDisplay.innerText + ` ${expression} `;
  });
}

function fac(num) {
  let res = 1;
  for (let i = 1; i <= num; i++) {
    res *= i;
  }
  return res;
}
