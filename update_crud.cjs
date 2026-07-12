const fs = require('fs');

let code = fs.readFileSync('sias-gas-project/Crud.gs', 'utf8');

const target = `    for (let i = 1; i < data.length; i++) {
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      result.push(obj);
    }`;

const replacement = `    let hasChanges = false;
    let idColIndex = headers.indexOf(kategori === 'Siswa' ? 'id_siswa' : 'id_guru');
    let qrColIndex = headers.indexOf('qr_content');
    
    for (let i = 1; i < data.length; i++) {
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      
      // Auto-generate missing ID or QR Content
      let needsSave = false;
      if (!obj[headers[idColIndex]]) {
        let prefix = kategori === 'Siswa' ? 'S-' : 'G-';
        let generatedId = prefix + new Date().getTime().toString() + Math.floor(Math.random() * 1000).toString();
        obj[headers[idColIndex]] = generatedId;
        sheet.getRange(i + 1, idColIndex + 1).setValue(generatedId);
        needsSave = true;
      }
      if (!obj[headers[qrColIndex]]) {
        let identifier = kategori === 'Siswa' ? obj['nisn'] : obj['nip_nuptk'];
        let name = kategori === 'Siswa' ? obj['nama_siswa'] : obj['nama_guru'];
        let generatedQr = obj[headers[idColIndex]] + "_" + identifier + "_" + name.replace(/\\s+/g, '-');
        obj[headers[qrColIndex]] = generatedQr;
        sheet.getRange(i + 1, qrColIndex + 1).setValue(generatedQr);
        needsSave = true;
      }
      if (needsSave) hasChanges = true;
      
      result.push(obj);
    }
    
    // Clear cache if we made changes
    if (hasChanges) {
      try {
        CacheService.getScriptCache().remove(cacheKey);
      } catch(e) {}
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('sias-gas-project/Crud.gs', code);
