(function () {

'use strict';

require('../css/app.css');

let rollTimer;
let msgTimer;

let Vue = require('./vue.js');
let app = new Vue({
  el: 'body',
  data: {
    candidates: [],
    winners: [],
    total: null,
    round: null,
    isRolling: false
  },
  computed: {
    isSetup: {
      get() {
        return this.candidates.length > 0;
      }
    },
    remaining: {
      get() {
        if (!this.isSetup) {
          return '∞';
        }
        return this.candidates.length;
      }
    }
  },
  methods: {
    setup() {
      if (this.$els.total.validationMessage) {
        alert(this.$els.total.validationMessage);
        return;
      }

      this.candidates = Array(this.total).fill(true).map((item, i) => pad(i + 1, 3));
      let round = this.$els.round;
      this.$nextTick(() => {
        round.focus();
      });
    },
    upload({target}) {
      let file = target.files[0];
      if (!file) {
        return;
      }
      let reader = new FileReader();
      reader.onload = ({target}) => {
        this.candidates = target.result
          .split('\n')
          .map(line => line.trim())
          .filter(line => line);
        this.total = this.candidates.length;
        console.log(this.candidates.length);
        let round = this.$els.round;
        this.$nextTick(() => {
          round.focus();
        });
      };
      reader.readAsText(file);
    },
    reset() {
      this.stopRoll();
      this.total = null;
      this.round = null;
      this.candidates = [];
      this.winners = [];
      this.$els.upload.value = '';
    },
    checkRemaining({target}) {
      let validity = ''
      if (this.candidates.length < this.round) {
        validity = '剩余人数不足' + this.round + '人。';
      }
      target.setCustomValidity(validity);
    },
    draw() {
      if (this.$els.round.validationMessage) {
        alert(this.$els.round.validationMessage);
        return;
      }

      if (!this.isRolling) {
        this.startRoll();

        let begin = this.$els.begin;
        this.$nextTick(() => {
          begin.focus();
        });
      } else { // 'end'
        this.stopRoll();
        this.winners = this.candidates.splice(0, this.round);
        this.checkRemaining({
          target: this.$els.round
        });
      }
    },
    shuffle() {
      shuffle(this.candidates);
    },
    startRoll() {
      this.stopRoll();
      rollTimer = setInterval(() => {
        this.shuffle();
        this.winners = this.candidates.slice(0, this.round);
      }, 1000 / 15);
      this.isRolling = true;
    },
    stopRoll: function () {
      clearTimeout(rollTimer);
      this.isRolling = false;
    }
  },
  watch: {
    winners(val, oldVal) {
      if (val == null || oldVal == null || val.length !== oldVal.length) {
        fitDisplay();
      }
    }
  }
});

window.onresize = fitDisplay;
window.onbeforeunload = () => {
  if (app.isSetup) {
    return '目前抽奖尚未结束，是否要离开？';
  }
};

function swap(items, i, j) {
  let k = items[i];
  items[i] = items[j];
  items[j] = k;
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    swap(items, i, j);
  }
}

function pad(number, digits) {
  let numDigits = Math.floor(Math.log10(number)) + 1;
  if (numDigits >= digits) {
    return '' + number;
  }
  return Array(digits - numDigits).fill(0).join('') + number;
}

function fitDisplay() {
  Vue.nextTick(() => {
    let display = document.getElementById('display');
    let content = display.querySelector('h1');
    content.style.fontSize = '';

    let computed;
    while (true) {
      let outerHeight = display.offsetHeight;
      let innerHeight = content.offsetHeight;
      if (innerHeight > outerHeight) {
        // 二分法明显快些，偷懒了……
        computed = parseInt(window.getComputedStyle(content).fontSize, 10);
        if (computed === 12) {
          break;
        }
        content.style.fontSize = (computed - 2) + 'px';
      } else {
        break;
      }
    }
  });
}

function getResultHTML(winners) {
  return winners.map(winner => {
     return '<span class="name">' + winner + '</span>';
  }).join('');
}

})();
