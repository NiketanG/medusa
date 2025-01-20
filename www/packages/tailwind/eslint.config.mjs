import eslintConfig from "eslint-config-docs"

export default [...eslintConfig.base, {
    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: true,
            tsconfigRootDir: __dirname,
        },
    },
}];