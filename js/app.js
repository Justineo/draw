(function () {

'use strict';

var placeholder = 'Who\'s feeling lucky?';
var rollTimer;
var msgTimer;

var Vue = require('./vue.js');
var app = new Vue({
  el: 'body',
  data: {
    display: placeholder,
    candidates: [],
    total: 10,
    round: 1,
    isSetup: false,
    isRolling: false,
    displayType: 'welcome'
  },
  computed: {
    remaining: {
      get: function () {
        if (!this.isSetup) {
          return '∞';
        }
        return this.candidates.length;
      }
    }
  },
  methods: {
    setup: function () {
      if (this.$els.total.validationMessage) {
        alert(this.$els.total.validationMessage);
        return;
      }

      this.candidates = Array(this.total).fill(true).map(function (item, i) {
        return pad(i + 1, 3);
      });
      this.isSetup = true;
      var round = this.$els.round;
      this.$nextTick(function () {
        round.focus();
      });
    },
    reset: function () {
      this.stopRoll();
      this.total = null;
      this.isSetup = false;
      this.show(placeholder, 'welcome');
      fitDisplay();
    },
    show: function (content, type) {
      this.displayType = type || 'normal';
      this.display = content;

      fitDisplay();
    },
    checkRemaining: function (e) {
      var validity = ''
      if (this.candidates.length < this.round) {
        validity = '剩余人数不足' + this.round + '人。';
      }
      e.target.setCustomValidity(validity);
    },
    draw: function (e) {
      if (this.$els.round.validationMessage) {
        alert(this.$els.round.validationMessage);
        return;
      }

      if (!this.isRolling) {
        this.startRoll();

        var begin = this.$els.begin;
        this.$nextTick(function () {
          begin.focus();
        });
      } else { // 'end'
        this.stopRoll();
        this.shuffle();
        var winners = this.candidates.splice(0, this.round);
        this.show(winners.map(function (winner) {
           return '<span class="name">' + winner + '</span>';
        }).join(''), 'result');
        this.checkRemaining({
          target: this.$els.round
        });
      }
    },
    shuffle: function () {
      shuffle(this.candidates);
    },
    startRoll: function () {
      this.stopRoll();
      var me = this;
      rollTimer = setInterval(function () {
        var name = me.candidates[Math.floor(Math.random() * me.candidates.length)];
        me.show('<span class="name">' + name + '</span>', 'rolling');
      }, 1000 / 15);
      this.isRolling = true;
    },
    stopRoll: function () {
      clearTimeout(rollTimer);
      this.isRolling = false;
    }
  }
});

window.onresize = fitDisplay;
window.onbeforeunload = function () {
  if (app.isSetup) {
    return '目前抽奖尚未结束，是否要离开？';
  }
};

function swap(items, i, j) {
  var k = items[i];
  items[i] = items[j];
  items[j] = k;
}

function shuffle(items) {
  for (var i = items.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    swap(items, i, j);
  }
}

function pad(number, digits) {
  var numDigits = Math.floor(Math.log10(number)) + 1;
  if (numDigits >= digits) {
    return '' + number;
  }
  return Array(digits - numDigits).fill(0).join('') + number;
}

function fitDisplay() {
  Vue.nextTick(function () {
    var display = document.getElementById('display');
    display.firstChild.style.fontSize = '';

    var computed;
    while (true) {
      var outerHeight = display.offsetHeight;
      var innerHeight = display.firstChild.offsetHeight;
      if (innerHeight > outerHeight) {
        // 二分法明显快些，偷懒了……
        computed = parseInt(window.getComputedStyle(display.firstChild).fontSize, 10);
        if (computed === 12) {
          break;
        }
        display.firstChild.style.fontSize = (computed - 2) + 'px';
      } else {
        break;
      }
    }
  });
}

})();
