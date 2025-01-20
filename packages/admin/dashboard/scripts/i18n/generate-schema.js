const fs = require("fs")
const path = require("path")

const translationsDir = path.join(__dirname, "../../src/i18n/translations")
const enPath = path.join(translationsDir, "en.json")
const schemaPath = path.join(translationsDir, "$schema.json")

function generateSchemaFromObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return { type: typeof obj }
  }

  if (Array.isArray(obj)) {
    return {
      type: "array",
      items: generateSchemaFromObject(obj[0] || "string"),
    }
  }

  const properties = {}
  const required = []

  Object.entries(obj).forEach(([key, value]) => {
    properties[key] = generateSchemaFromObject(value)
    required.push(key)
  })

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  }
}

try {
  const enJson = JSON.parse(fs.readFileSync(enPath, "utf-8"))

  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...generateSchemaFromObject(enJson),
  }

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2))
  console.log("Schema generated successfully at:", schemaPath)
} catch (error) {
  console.error("Error generating schema:", error.message)
  process.exit(1)
}
