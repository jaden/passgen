const crypto = window.crypto || window.msCrypto;

function getRandomNumber(ceiling) {
  return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1) * ceiling);
}

function getEntropy(length, numPossibleSymbols) {
  if (!length || !numPossibleSymbols) {
    return null;
  }

  return Math.round(Math.log2(Math.pow(numPossibleSymbols, length)) * 100) / 100;
}

const characterSets = [
  { name: 'a-z', value: 'abcdefghijklmnopqrstuvwxyz' },
  { name: 'A-Z', value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { name: '0-9', value: '0123456789' },
  { name: 'Symbols', value: '~!@#$%^&*-_=+' },
  { name: 'Special', value: ':;|/,.?()[]{}<>' },
];

new Vue({
  el: '#app',
  data: {
    charSets: characterSets,
    selectedCharSets: [],
    extraCharacters: '',
    passwordLength: 25,
    password: '',
    clipboardButton: null,
    isToastVisible: false,
  },

  mounted: function () {
    this.clipboardButton = new ClipboardJS('#clipboard-button');
    this.clipboardButton.on('success', this.showToast);
    this.initializeCharacterSelection();
  },

  methods: {
    generatePassword: function () {
      let password = '';

      for (let i = 0; i < this.passwordLength; i++) {
        password += this.characters.charAt(getRandomNumber(this.characters.length));
      }

      this.password = password;
    },

    initializeCharacterSelection: function () {
      this.selectedCharSets = characterSets.slice(0, 4);
      this.extraCharacters = '';
    },

    clearCharacterSelection: function () {
      this.selectedCharSets = [];
      this.extraCharacters = '';
    },

    showToast: function () {
      this.isToastVisible = true;

      setTimeout(this.hideToast, 5500);
    },

    hideToast: function () {
      this.isToastVisible = false;
    }
  },

  watch: {
    characters: function () {
      this.generatePassword();
    },

    passwordLength: function () {
      this.generatePassword();
    },
  },

  computed: {
    characters: function () {
      return this.selectedCharSets
        .map(item => item.value)
        .flat()
        .join('') + this.extraCharacters;
    },
    entropy: function () {
      const uniqueCharacters = new Set(this.characters);
      return getEntropy(this.passwordLength, uniqueCharacters.size);
    },
  },
});
