class Calculator {
  constructor() {
    this.display = document.querySelector('.display');
    this.currentInput = '0';
    this.previousInput = '';
    this.operation = null;
    this.waitingForNewInput = false;

    this.init();
  }

  init() {
    // Обработчики для цифр
    document.querySelector('.digits').addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.handleDigit(e.target.textContent);
      }
    });

    // Обработчики для операций
    document.querySelector('.operations').addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.handleOperation(e.target.textContent);
      }
    });

    // Обработчики для правых операций
    document
      .querySelector('.operations-right')
      .addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          this.handleRightOperation(e.target.textContent);
        }
      });
  }

  handleDigit(digit) {
    if (this.waitingForNewInput || this.currentInput === '0') {
      this.currentInput = digit;
      this.waitingForNewInput = false;
    } else {
      this.currentInput += digit;
    }
    this.updateDisplay();
  }

  handleOperation(op) {
    switch (op) {
      case 'C':
        this.clear();
        break;
      case '/':
        this.setOperation('divide');
        break;
      case 'X':
        this.setOperation('multiply');
        break;
    }
  }

  handleRightOperation(op) {
    switch (op) {
      case 'clear':
        this.clear();
        break;
      case '-':
        this.setOperation('subtract');
        break;
      case '+':
        this.setOperation('add');
        break;
      case '=':
        this.calculate();
        break;
    }
  }

  setOperation(op) {
    if (this.operation !== null && !this.waitingForNewInput) {
      this.calculate();
    }
    this.operation = op;
    this.previousInput = this.currentInput;
    this.waitingForNewInput = true;
  }

  calculate() {
    let result;
    const prev = parseFloat(this.previousInput);
    const current = parseFloat(this.currentInput);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case 'add':
        result = prev + current;
        break;
      case 'subtract':
        result = prev - current;
        break;
      case 'multiply':
        result = prev * current;
        break;
      case 'divide':
        result = prev / current;
        break;
      default:
        return;
    }

    this.currentInput = result.toString();
    this.operation = null;
    this.previousInput = '';
    this.waitingForNewInput = true;
    this.updateDisplay();
  }

  clear() {
    this.currentInput = '0';
    this.previousInput = '';
    this.operation = null;
    this.waitingForNewInput = false;
    this.updateDisplay();
  }

  updateDisplay() {
    this.display.textContent = this.currentInput;
  }
}

// Инициализация калькулятора
new Calculator();
