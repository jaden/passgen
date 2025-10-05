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
const maxPasswordLength = 1024;

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
    this.initializeForm();
  },

  methods: {
    generatePassword: function () {
      if (this.passwordLength <= 0 || this.passwordLength > maxPasswordLength) {
        this.passwordLength = defaultPasswordLength;
      }

      const charArray = Array.from(this.characters);

      const randomIndexes = getRandomNumbers(charArray.length, this.passwordLength);
      let password = '';

      for (let i = 0; i < this.passwordLength; i++) {
        password += charArray[randomIndexes[i]];
      }

      this.password = password;
    },

    initializeForm: function () {
      this.passwordLength = defaultPasswordLength;
      this.selectedCharSets = characterSets.slice(0, 4);
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
      const characters = this.selectedCharSets.map(item => item.value).join('') + this.extraCharacters;
      const charactersSet = new Set(Array.from(characters));

      return [...charactersSet].join('');
    },
    entropy: function () {
      const uniqueCharacters = new Set(this.characters);
      return getEntropy(this.passwordLength, uniqueCharacters.size);
    },
  },
});

app.mount('#app');
