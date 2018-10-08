module.exports = {
  svgo: true,
  prettier: false,
  svgoConfig: {
    plugins: [
      { prefixIds: false }, // не ломаем хеш ссылки из свг на документ префиксами
    ],
    js2svg: {
      // eslint-disable-next-line no-empty-character-class
      regEntities: /[]/g, // не ескейпим ничего в тексте
    },
  },
  jsx: {
    babelConfig: {
      generatorOpts: {
        jsescOption: {
          minimal: true, // не преборазуем кириллицу в \u сиквенс, впрочем это преобразование вообще не валидно для xml-домена
        },
      },
    },
  },
}
