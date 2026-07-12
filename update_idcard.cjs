const fs = require('fs');
let code = fs.readFileSync('src/components/IdCard.tsx', 'utf8');

// Replace constants and dynamic fetching
code = code.replace(
  /const address = "-"; \/\/ Default if no address provided in data/,
  `const schoolName = localStorage.getItem('cardSchoolName') || 'SMK AL-HIKAM KREJENGAN';
  const schoolAddress = localStorage.getItem('cardSchoolAddress') || 'Krejengan Kec. Krejengan Kab. Probolinggo';
  const principalName = localStorage.getItem('cardPrincipalName') || 'Fulan, S.Pd';
  const signatureUrl = localStorage.getItem('cardSignatureUrl') || '';
  const logoLeftUrl = localStorage.getItem('cardLogoLeftUrl') || '';
  const logoRightUrl = localStorage.getItem('cardLogoRightUrl') || '';`
);

// Remove Bottom Left Slashes
code = code.replace(
  /\{\/\* Bottom Left Slashes \*\/\}[\s\S]*?\{\/\* Top Header Section \*\/\}/,
  `{/* Top Header Section */}`
);

// Remove Bottom Right Slashes and add Footer Decor
code = code.replace(
  /\{\/\* Bottom Right Slash \*\/\}[\s\S]*?\{\/\* Content Area \*\/\}/,
  `{/* Footer Decor */}
        <div className="absolute bottom-0 left-0 w-full h-[12px] bg-[#d97706] z-10"></div>
        <div className="absolute bottom-[8px] left-0 w-full h-[18px] bg-[#3b82f6] rounded-t-[100%] z-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-[12px] bg-[#1e3a8a] rounded-t-[100%] z-30"></div>
        {/* Content Area */}`
);

// Update Header section with dynamic logos and school name
code = code.replace(
  /<div className="w-9 h-9 rounded-full border border-\[#d97706\] bg-\[#1e3a8a\] flex items-center justify-center p-1 shadow-sm">[\s\S]*?<GraduationCap className="w-5 h-5 text-\[#d97706\]" \/>[\s\S]*?<\/div>[\s\S]*?<div className="text-center flex-grow">[\s\S]*?<h2 className="text-\[#d97706\] font-black text-\[14px\] leading-none tracking-wide">KARTU IDENTITAS<\/h2>[\s\S]*?<h3 className="text-white font-bold text-\[10px\] uppercase leading-tight tracking-wider mt-0\.5">SMK AL-HIKAM KREJENGAN<\/h3>[\s\S]*?<\/div>[\s\S]*?<div className="w-9 h-9 rounded-full border border-\[#d97706\] bg-\[#1e3a8a\] flex items-center justify-center p-1 shadow-sm">[\s\S]*?<BookOpen className="w-5 h-5 text-\[#3b82f6\]" \/>[\s\S]*?<\/div>/,
  `{logoLeftUrl ? (
              <img src={logoLeftUrl} alt="Logo" className="w-9 h-9 rounded-full object-cover border border-[#d97706] bg-[#1e3a8a] p-0.5 shadow-sm" crossOrigin="anonymous" />
            ) : (
              <div className="w-9 h-9 rounded-full border border-[#d97706] bg-[#1e3a8a] flex items-center justify-center p-1 shadow-sm">
                <GraduationCap className="w-5 h-5 text-[#d97706]" />
              </div>
            )}
            <div className="text-center flex-grow">
              <h2 className="text-[#d97706] font-black text-[14px] leading-none tracking-wide">KARTU IDENTITAS</h2>
              <h3 className="text-white font-bold text-[10px] uppercase leading-tight tracking-wider mt-0.5">{schoolName}</h3>
            </div>
            {logoRightUrl ? (
              <img src={logoRightUrl} alt="Logo" className="w-9 h-9 rounded-full object-cover border border-[#d97706] bg-[#1e3a8a] p-0.5 shadow-sm" crossOrigin="anonymous" />
            ) : (
              <div className="w-9 h-9 rounded-full border border-[#d97706] bg-[#1e3a8a] flex items-center justify-center p-1 shadow-sm">
                <BookOpen className="w-5 h-5 text-[#3b82f6]" />
              </div>
            )}`
);

// Update address ribbon
code = code.replace(
  /<span className="text-\[7px\] text-white font-bold uppercase tracking-widest">Krejengan Kec\. Krejengan Kab\. Probolinggo<\/span>/,
  `<span className="text-[7px] text-white font-bold uppercase tracking-widest">{schoolAddress}</span>`
);

// Hide Jurusan for Siswa
code = code.replace(
  /<tr>\s*<td className="align-top">\{jabatanLabel\}<\/td>\s*<td className="px-1 align-top">:<\/td>\s*<td className="align-top leading-tight">\{jabatanValue \|\| "-"\}<\/td>\s*<\/tr>/,
  `{!isSiswa && (
                  <tr>
                    <td className="align-top">{jabatanLabel}</td>
                    <td className="px-1 align-top">:</td>
                    <td className="align-top leading-tight">{jabatanValue || "-"}</td>
                  </tr>
                )}`
);

// Update Signature Area
code = code.replace(
  /<div className="mt-\[28px\] border-t border-gray-800 border-dotted pt-\[2px\] w-\[80px\] mx-auto text-\[6px\]">\s*Ttd\. Kepala Sekolah\s*<\/div>/,
  `<div className="mt-1 flex justify-center items-center h-[24px]">
                {signatureUrl ? (
                  <img src={signatureUrl} alt="Tanda Tangan" className="h-[24px] object-contain" crossOrigin="anonymous" />
                ) : null}
              </div>
              <div className="border-t border-gray-800 pt-[2px] w-[80px] mx-auto text-[7px] font-bold">
                {principalName}
              </div>`
);

// Update back card terms
code = code.replace(
  /SMK AL-HIKAM Krejengan Probolinggo\./,
  `{schoolName}.`
);

fs.writeFileSync('src/components/IdCard.tsx', code);
