// ==========================================
// FILE: Crud.gs 
// ==========================================

function getDataMaster(kategori) {
  try {
    let cacheKey = "MASTER_DATA_" + kategori;
    let cachedData = null;
    try {
      cachedData = CacheService.getScriptCache().get(cacheKey);
    } catch(e) {}
    
    if (cachedData) {
      return { success: true, data: JSON.parse(cachedData) };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = kategori === 'Siswa' ? ss.getSheetByName('data_siswa') : ss.getSheetByName('data_guru');
    if (!sheet) return { success: false, data: [] };
    
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) return { success: true, data: [] };
    
    let result = [];
    let headers = data[0];
    
    let passwordColIndex = headers.indexOf('password');
    if (kategori === 'Guru' && passwordColIndex === -1) {
      sheet.getRange(1, headers.length + 1).setValue('password');
      headers.push('password');
      passwordColIndex = headers.length - 1;
    }
    
    if (data.length <= 1) return { success: true, data: [] };
    
    let hasChanges = false;
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
        let generatedQr = obj[headers[idColIndex]] + "_" + identifier + "_" + name.replace(/\s+/g, '-');
        obj[headers[qrColIndex]] = generatedQr;
        sheet.getRange(i + 1, qrColIndex + 1).setValue(generatedQr);
        needsSave = true;
      }
      if (kategori === 'Guru') {
        if (!obj['password']) {
          obj['password'] = 'guru123';
          sheet.getRange(i + 1, passwordColIndex + 1).setValue('guru123');
          needsSave = true;
        }
      }
      if (needsSave) hasChanges = true;
      
      result.push(obj);
    }
    
    // Clear cache if we made changes
    if (hasChanges) {
      try {
        CacheService.getScriptCache().remove(cacheKey);
      } catch(e) {}
    }
    
    // Simpan ke cache selama 2 jam (7200 detik) untuk load instan di request berikutnya
    try {
      CacheService.getScriptCache().put(cacheKey, JSON.stringify(result), 7200); 
    } catch(e) {}
    
    return JSON.parse(JSON.stringify({ success: true, data: result }));
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function tambahDataMaster(kategori, dataObj) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = kategori === 'Siswa' ? ss.getSheetByName('data_siswa') : ss.getSheetByName('data_guru');
    
    let prefix = kategori === 'Siswa' ? 'S-' : 'G-';
    let timeStamp = new Date().getTime().toString().slice(-4);
    let randomNum = Math.floor(Math.random() * 1000);
    let idBaru = prefix + timeStamp + randomNum;
    let qrContent = "QR-" + idBaru;
    
    let rowData = [];
    if (kategori === 'Siswa') {
       rowData = [idBaru, dataObj.nisn, dataObj.nama_siswa, dataObj.jenis_kelamin, dataObj.kelas, dataObj.jurusan, dataObj.no_hp_ortu, qrContent];
    } else {
       rowData = [idBaru, dataObj.nip_nuptk, dataObj.nama_guru, dataObj.jenis_kelamin, dataObj.jabatan_tugas, dataObj.no_hp, qrContent, dataObj.password || 'guru123'];
    }
    sheet.appendRow(rowData);
    
    // Invalidate Cache
    try { CacheService.getScriptCache().remove("MASTER_DATA_" + kategori); } catch(e) {}
    
    return { success: true, message: `Berhasil menambahkan data ${kategori} baru` };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function editDataMaster(kategori, idTarget, dataObj) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = kategori === 'Siswa' ? ss.getSheetByName('data_siswa') : ss.getSheetByName('data_guru');
    const data = sheet.getDataRange().getValues();
    
    for(let i=1; i<data.length; i++){
      if(data[i][0] == idTarget){
         if (kategori === 'Siswa') {
           sheet.getRange(i+1, 2, 1, 6).setValues([[dataObj.nisn, dataObj.nama_siswa, dataObj.jenis_kelamin, dataObj.kelas, dataObj.jurusan, dataObj.no_hp_ortu]]);
         } else {
           sheet.getRange(i+1, 2, 1, 5).setValues([[dataObj.nip_nuptk, dataObj.nama_guru, dataObj.jenis_kelamin, dataObj.jabatan_tugas, dataObj.no_hp]]);
           let headers = data[0];
           let passwordColIndex = headers.indexOf('password');
           if (passwordColIndex !== -1) {
             sheet.getRange(i+1, passwordColIndex + 1).setValue(dataObj.password || 'guru123');
           }
         }
         
         // Invalidate Cache
         try { CacheService.getScriptCache().remove("MASTER_DATA_" + kategori); } catch(e) {}
         return { success: true, message: "Data berhasil diubah secara permanen." };
      }
    }
    return { success: false, message: "ID Target tidak ditemukan di database." };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function hapusDataMaster(kategori, idTarget) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = kategori === 'Siswa' ? ss.getSheetByName('data_siswa') : ss.getSheetByName('data_guru');
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++){
      if(data[i][0] == idTarget){
         sheet.deleteRow(i+1);
         // Invalidate Cache
         try { CacheService.getScriptCache().remove("MASTER_DATA_" + kategori); } catch(e) {}
         return { success: true, message: "Data terhapus permanen dari sistem." };
      }
    }
    return { success: false, message: "Data gagal dihapus: ID tidak dikenal." };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function importDataMassal(kategori, arrayData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = kategori === 'Siswa' ? ss.getSheetByName('data_siswa') : ss.getSheetByName('data_guru');
    let writeData = [];
    
    arrayData.forEach((dataObj, index) => {
      let prefix = kategori === 'Siswa' ? 'S-' : 'G-';
      let timeStamp = new Date().getTime().toString().slice(-4);
      let idBaru = prefix + timeStamp + index;
      let qrContent = "QR-" + idBaru;
      
      if (kategori === 'Siswa') {
         writeData.push([idBaru, dataObj.nisn||'-', dataObj.nama_siswa||'-', dataObj.jenis_kelamin||'-', dataObj.kelas||'-', dataObj.jurusan||'-', dataObj.no_hp_ortu||'-', qrContent]);
      } else {
         writeData.push([idBaru, dataObj.nip_nuptk||'-', dataObj.nama_guru||'-', dataObj.jenis_kelamin||'-', dataObj.jabatan_tugas||'-', dataObj.no_hp||'-', qrContent]);
      }
    });
    
    if(writeData.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, writeData.length, writeData[0].length).setValues(writeData);
      // Invalidate Cache
      try { CacheService.getScriptCache().remove("MASTER_DATA_" + kategori); } catch(e) {}
    }
    return { success: true, message: `Migrasi file Excel sukses. ${writeData.length} baris telah dimasukkan ke Database.` };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// ========================================================
// USER ACCOUNTS (users sheet) CRUD
// ========================================================

function getUsersSemua() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("users");
    if (!sheet) return { success: false, data: [] };
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };
    const result = [];
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      result.push(obj);
    }
    return { success: true, data: result };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function tambahUserData(userObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("users");
    if (!sheet) return { success: false, message: "Tabel users tidak ditemukan." };
    
    // Check if username already exists
    const data = sheet.getDataRange().getValues();
    const usernameInput = String(userObj.username).trim();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === usernameInput.toLowerCase()) {
        return { success: false, message: "Username sudah terdaftar!" };
      }
    }
    
    sheet.appendRow([
      usernameInput,
      String(userObj.password || "123456").trim(),
      userObj.role || "TU",
      userObj.target_id || "-"
    ]);
    return { success: true, message: "Berhasil menambahkan akun user baru." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function editUserData(oldUsername, userObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("users");
    if (!sheet) return { success: false, message: "Tabel users tidak ditemukan." };
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(oldUsername).trim().toLowerCase()) {
        sheet.getRange(i + 1, 1, 1, 4).setValues([[
          String(userObj.username).trim(),
          String(userObj.password).trim(),
          userObj.role,
          userObj.target_id || "-"
        ]]);
        return { success: true, message: "Berhasil memperbarui data user." };
      }
    }
    return { success: false, message: "User tidak ditemukan." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function hapusUserData(username) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("users");
    if (!sheet) return { success: false, message: "Tabel users tidak ditemukan." };
    const data = sheet.getDataRange().getValues();
    
    if (String(username).trim().toLowerCase() === "admin") {
      return { success: false, message: "Akun 'admin' utama tidak boleh dihapus demi keamanan!" };
    }
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(username).trim().toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "User berhasil dihapus secara permanen." };
      }
    }
    return { success: false, message: "User tidak ditemukan." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ========================================================
// JADWAL GURU CRUD
// ========================================================

function getJadwalGuruSemua() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName("jadwal_guru");
    if (!sheet) {
      sheet = ss.insertSheet("jadwal_guru");
      const headers = ["id_jadwal", "id_guru", "nama_guru", "hari", "jam_masuk_mulai", "jam_masuk_batas", "jam_pulang_mulai"];
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#d97706") // amber-600 color
                 .setFontColor("white")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    }
    const data = sheet.getDataRange().getValues();
    const displayData = sheet.getDataRange().getDisplayValues();
    if (data.length <= 1) return { success: true, data: [] };
    const result = [];
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = displayData[i][j] || data[i][j];
      }
      result.push(obj);
    }
    return { success: true, data: result };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function tambahJadwalGuru(jadwalObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName("jadwal_guru");
    if (!sheet) {
      getJadwalGuruSemua(); // triggers creation
      sheet = ss.getSheetByName("jadwal_guru");
    }
    
    // Check duplicate schedule for same guru on same day
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === jadwalObj.id_guru && data[i][3] === jadwalObj.hari) {
        return { success: false, message: `Jadwal untuk guru tersebut di hari ${jadwalObj.hari} sudah ada!` };
      }
    }
    
    const idJadwal = "J-" + new Date().getTime() + Math.floor(Math.random() * 100);
    sheet.appendRow([
      idJadwal,
      jadwalObj.id_guru,
      jadwalObj.nama_guru,
      jadwalObj.hari,
      jadwalObj.jam_masuk_mulai,
      jadwalObj.jam_masuk_batas,
      jadwalObj.jam_pulang_mulai
    ]);
    return { success: true, message: "Jadwal guru berhasil disimpan." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function editJadwalGuru(idJadwal, jadwalObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("jadwal_guru");
    if (!sheet) return { success: false, message: "Jadwal tidak ditemukan." };
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === idJadwal) {
        sheet.getRange(i + 1, 2, 1, 6).setValues([[
          jadwalObj.id_guru,
          jadwalObj.nama_guru,
          jadwalObj.hari,
          jadwalObj.jam_masuk_mulai,
          jadwalObj.jam_masuk_batas,
          jadwalObj.jam_pulang_mulai
        ]]);
        return { success: true, message: "Jadwal guru berhasil diperbarui." };
      }
    }
    return { success: false, message: "Jadwal tidak ditemukan." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function hapusJadwalGuru(idJadwal) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("jadwal_guru");
    if (!sheet) return { success: false, message: "Jadwal tidak ditemukan." };
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === idJadwal) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Jadwal guru berhasil dihapus." };
      }
    }
    return { success: false, message: "Jadwal tidak ditemukan." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}
