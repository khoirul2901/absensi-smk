const fs = require('fs');
let code = fs.readFileSync('src/components/IdCard.tsx', 'utf8');

const target = `          {/* QR Code Box */}
          <div className="w-[85px] h-[100px] bg-[#d97706] p-1 shadow-sm shrink-0 flex flex-col justify-center mt-1">
            <div className="w-full h-full bg-white flex flex-col items-center justify-center relative">
               <img 
                  src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${encodeURIComponent(qrContent)}\`} 
                  alt="QR Code" 
                  className="w-[65px] h-[65px] object-contain"
                 referrerPolicy="no-referrer"
               />
               <span className="text-[7px] font-bold text-gray-500 mt-1 uppercase text-center leading-none">QR Absensi</span>
            </div>
          </div>`;

const replacement = `          {/* QR Code Box */}
          <div className="w-[85px] h-[100px] shrink-0 flex flex-col justify-center items-center mt-1 z-20">
               <img 
                  src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${encodeURIComponent(qrContent)}&bgcolor=e6e6e6\`} 
                  alt="QR Code" 
                  className="w-[70px] h-[70px] object-contain mix-blend-multiply"
                 referrerPolicy="no-referrer"
               />
               <span className="text-[7px] font-bold text-gray-500 mt-1 uppercase text-center leading-none">QR Absensi</span>
          </div>`;

// Use regex since spacing might differ
code = code.replace(/\{\/\* QR Code Box \*\/\}[\s\S]*?<\/div>\s*<\/div>/, replacement);

// Fix TS error in Settings.tsx
let settingsCode = fs.readFileSync('src/components/Settings.tsx', 'utf8');
settingsCode = settingsCode.replace(/const handleCardConfigChange = \(e\) => \{/, 'const handleCardConfigChange = (e: any) => {');
fs.writeFileSync('src/components/Settings.tsx', settingsCode);

fs.writeFileSync('src/components/IdCard.tsx', code);
