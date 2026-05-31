const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "app", "instrutor", "comercial", "apresentacao", "page.tsx");

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  
  lines.forEach((line, idx) => {
    if (line.includes("Instagram")) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  });
} else {
  console.log("File not found");
}
