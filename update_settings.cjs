const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const importRegex = /import \{[\s\S]*?\} from "lucide-react";/;
code = code.replace(importRegex, match => {
  return match.replace("HelpCircle", "HelpCircle,\n  CreditCard,\n  Image as ImageIcon");
});

const stateHooksRegex = /const \[loading, setLoading\] = useState\(false\);/;
const stateHooks = `const [loading, setLoading] = useState(false);

  // Card Settings
  const [cardConfig, setCardConfig] = useState({
    schoolName: localStorage.getItem('cardSchoolName') || 'SMK AL-HIKAM KREJENGAN',
    schoolAddress: localStorage.getItem('cardSchoolAddress') || 'Krejengan Kec. Krejengan Kab. Probolinggo',
    principalName: localStorage.getItem('cardPrincipalName') || 'Fulan, S.Pd',
    signatureUrl: localStorage.getItem('cardSignatureUrl') || '',
    logoLeftUrl: localStorage.getItem('cardLogoLeftUrl') || '',
    logoRightUrl: localStorage.getItem('cardLogoRightUrl') || ''
  });

  const handleCardConfigChange = (e) => {
    const { name, value } = e.target;
    setCardConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCardConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('cardSchoolName', cardConfig.schoolName);
    localStorage.setItem('cardSchoolAddress', cardConfig.schoolAddress);
    localStorage.setItem('cardPrincipalName', cardConfig.principalName);
    localStorage.setItem('cardSignatureUrl', cardConfig.signatureUrl);
    localStorage.setItem('cardLogoLeftUrl', cardConfig.logoLeftUrl);
    localStorage.setItem('cardLogoRightUrl', cardConfig.logoRightUrl);
    alert('Pengaturan kartu berhasil disimpan!');
  };`;
code = code.replace(stateHooksRegex, stateHooks);

const uiSection = `      {/* CARD SETTINGS MANAGER */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <CreditCard className="w-5 h-5 text-fuchsia-500" />
          <h3 className="font-bold text-gray-800 text-sm">Pengaturan Desain Kartu</h3>
        </div>
        <form onSubmit={handleSaveCardConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">Nama Sekolah</label>
            <input type="text" name="schoolName" value={cardConfig.schoolName} onChange={handleCardConfigChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">Alamat Sekolah</label>
            <input type="text" name="schoolAddress" value={cardConfig.schoolAddress} onChange={handleCardConfigChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">Nama Kepala Sekolah</label>
            <input type="text" name="principalName" value={cardConfig.principalName} onChange={handleCardConfigChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">URL Tanda Tangan (Opsional)</label>
            <input type="text" name="signatureUrl" value={cardConfig.signatureUrl} onChange={handleCardConfigChange} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">URL Logo Kiri (Opsional)</label>
            <input type="text" name="logoLeftUrl" value={cardConfig.logoLeftUrl} onChange={handleCardConfigChange} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">URL Logo Kanan (Opsional)</label>
            <input type="text" name="logoRightUrl" value={cardConfig.logoRightUrl} onChange={handleCardConfigChange} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="sm:col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-fuchsia-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-fuchsia-700 transition-all duration-150 flex items-center gap-1.5 shadow-sm">
              <Save className="w-4 h-4" />
              Simpan Pengaturan Kartu
            </button>
          </div>
        </form>
      </div>

      {/* HOLIDAYS MANAGER */}`;
code = code.replace("{/* HOLIDAYS MANAGER */}", uiSection);

fs.writeFileSync('src/components/Settings.tsx', code);
