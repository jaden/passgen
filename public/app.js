function getRandomNumber(ceiling) {
  const maxUint = 0xFFFFFFFF; // 2^32 - 1
  const maxSafeValue = maxUint - (maxUint % ceiling);
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] > maxSafeValue); // Loop until it's in the safe, non-biased range

  return buffer[0] % ceiling;
}

function getEntropy(length, numPossibleSymbols) {
  if (!length || !numPossibleSymbols) {
    return null;
  }

  return Math.round(length * Math.log2(numPossibleSymbols) * 100) / 100;
}

const characterSets = [
  { name: 'a-z', value: 'abcdefghijklmnopqrstuvwxyz' },
  { name: 'A-Z', value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { name: '0-9', value: '0123456789' },
  { name: 'Symbols', value: '!@#$%-_+?' },
  { name: 'Special', value: '~^&*:;|/,.=' },
  { name: 'Brackets', value: '()[]{}<>' },
];

const defaultPasswordLength = 25;
const maxPasswordLength = 128;

const app = Vue.createApp({
  data() {
    return {
      charSets: characterSets,
      selectedCharSets: [],
      extraCharacters: '',
      passwordLength: defaultPasswordLength,
      password: '',
      clipboardButton: null,
      isToastVisible: false,
    };
  },

  mounted: function () {
    this.clipboardButton = new ClipboardJS('#clipboard-button');
    this.clipboardButton.on('success', this.showToast);
    this.initializeCharacterSelection();
  },

  methods: {
    generatePassword: function () {
      let password = '';

      if (this.passwordLength <= 0 || this.passwordLength > maxPasswordLength) {
        this.passwordLength = defaultPasswordLength;
      }

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

app.mount('#app');
