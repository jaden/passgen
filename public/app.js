function getRandomNumbers(ceiling, count) {
  const maxValue = 65535; // 2^16 - 1
  const maxSafeValue = maxValue - (maxValue % ceiling);
  const buffer = new Uint16Array(count);
  const results = new Array(count);

  let resultCount = 0;

  // Only add values in the non-biased range (0 to maxSafeValue)
  while (resultCount < count) {
    crypto.getRandomValues(buffer);

    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] < maxSafeValue) {
        results[resultCount++] = buffer[i] % ceiling;

        if (resultCount >= count) {
          break;
        }
      }
    }
  }

  return results;
}

function getEntropy(length, numPossibleSymbols) {
  if (!length || !numPossibleSymbols) {
    return 0;
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

const app = Vue.createApp({
  data() {
    return {
      characterSets,
      selectedCharSets: [],
      extraCharacters: '',
      passwordLength: defaultPasswordLength,
      maxPasswordLength: 128,
      password: '',
      clipboardButton: null,
      isToastVisible: false,
    };
  },

  mounted: function () {
    this.clipboardButton = new ClipboardJS('#clipboard-button');
    this.clipboardButton.on('success', this.showToast);
    this.initializeForm();
  },

  methods: {
    generatePassword: function () {
      if (this.characters === null || this.characters.length === 0) {
        return this.password = '';
      }

      if (this.passwordLength <= 0 || this.passwordLength > this.maxPasswordLength) {
        this.passwordLength = defaultPasswordLength;
      }

      const randomIndexes = getRandomNumbers(this.characters.length, this.passwordLength);
      let password = '';

      for (let i = 0; i < this.passwordLength; i++) {
        password += this.characters[randomIndexes[i]];
      }

      this.password = password;
    },

    initializeForm: function () {
      this.passwordLength = defaultPasswordLength;
      this.selectedCharSets = ['a-z', 'A-Z', '0-9'];
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
      const allCharacters = this.selectedCharSets
        .map(name => this.characterSets.find(set => set.name === name)?.value ?? '')
        .join('') + this.extraCharacters;

      return [...new Set(Array.from(allCharacters))];
    },

    entropy: function () {
      return getEntropy(this.passwordLength, this.characters.length);
    },
  },
});

app.mount('#app');
