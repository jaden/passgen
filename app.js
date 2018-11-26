const crypto = window.crypto || window.msCrypto;

function getRandomNumber(length) {
  return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1) * length);
}

new Vue({
  el: '#app',
  data: {
    characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
    length: 25,
    password: '',
  },

  mounted: function () {
    this.generatePassword();
  },

  methods: {
    generatePassword: function () {
      let password = '';

      for (let i = 0; i < this.length; i++) {
        password += this.characters.charAt(getRandomNumber(this.characters.length));
      }

      this.password = password;
    }
  }
});
