const templateDb = require("./helpers/useTemplateDb")

module.exports = async () => {
  await templateDb.destroy()
}
