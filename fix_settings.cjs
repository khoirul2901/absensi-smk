const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

code = code.replace(/const handleSaveCardConfig = \(e\) => \{/, 'const handleSaveCardConfig = (e: any) => {');

fs.writeFileSync('src/components/Settings.tsx', code);
