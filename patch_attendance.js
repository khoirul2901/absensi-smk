const fs = require('fs');
let code = fs.readFileSync('sias-gas-project/Attendance.gs', 'utf-8');

const helperFunc = `
function hitungStatusHadir(idTarget, kategori, jamSaatIni, ss) {
  let baseConfigJam = getPengaturanSemua();
  let configJam = {
    jam_masuk_mulai: normalizeWaktu(baseConfigJam.jam_masuk_mulai),
    jam_masuk_batas: normalizeWaktu(baseConfigJam.jam_masuk_batas),
    jam_pulang_mulai: normalizeWaktu(baseConfigJam.jam_pulang_mulai)
  };
  
  if (kategori === 'Guru') {
    const hariIniIndo = getHariIniIndo();
    const ssJadwal = ss.getSheetByName("jadwal_guru");
    if (ssJadwal) {
      const dataJadwal = ssJadwal.getDataRange().getValues();
      const displayDataJadwal = ssJadwal.getDataRange().getDisplayValues();
      for (let i = 1; i < dataJadwal.length; i++) {
        if (dataJadwal[i][1] === idTarget && String(dataJadwal[i][3]).trim() === hariIniIndo) {
          configJam = {
            jam_masuk_mulai: normalizeWaktu(displayDataJadwal[i][4] || dataJadwal[i][4]),
            jam_masuk_batas: normalizeWaktu(displayDataJadwal[i][5] || dataJadwal[i][5]),
            jam_pulang_mulai: normalizeWaktu(displayDataJadwal[i][6] || dataJadwal[i][6])
          };
          break;
        }
      }
    }
  }
  
  return (jamSaatIni <= configJam.jam_masuk_batas) ? "Tepat Waktu" : "Terlambat";
}
`;

code = helperFunc + "\n" + code;

code = code.replace(
  `function simpanAbsenManual(idTarget, kategori, mode, tanggal, status, keterangan) {`,
  `function simpanAbsenManual(idTarget, kategori, mode, tanggal, status, keterangan) {
  const jamSaatIni = getJamSaatIni();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (status === "Hadir (Auto)") {
     status = hitungStatusHadir(idTarget, kategori, jamSaatIni, ss);
  }`
);

// We need to handle `const jamSaatIni = getJamSaatIni();` and `const ss = SpreadsheetApp.getActiveSpreadsheet();` that was already there.
// Instead of simple replace, let's just do it manually.
