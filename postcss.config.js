module.exports = {
  plugins: {
    'postcss-cssnext': {
      warnForDuplicates : false,
      browsers:[
        "> 1%",
        "last 2 versions",
        "not ie <= 8",
        "iOS >= 8",
        "Firefox ESR",
        "Opera 12.1"
      ]
    }
  }
}
