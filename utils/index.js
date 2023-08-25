export function isValidJSON(jsonString) {
  try {
    if (jsonString === "null") throw new Error()
    const json = JSON.parse(jsonString)
    return {
      isValid: true,
      value: json
    }
  } catch {
    return {
      isValid: false,
      value: jsonString
    }
  }
}