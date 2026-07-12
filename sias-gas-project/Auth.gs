// ==========================================
// FILE: Auth.gs 
// ==========================================

function verifikasiLogin(username, password) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Cek di sheet users dulu (untuk Admin dsb)
    const sheetUsers = ss.getSheetByName("users");
    if (sheetUsers) {
      const data = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        let dbUsername = String(data[i][0]).trim();
        let dbPassword = String(data[i][1]).trim();
        
        if (dbUsername === username && dbPassword === password) {
          let role = data[i][2];
          let targetId = data[i][3];
          return {
            success: true,
            role: role,
            target_id: targetId,
            username: dbUsername,
            message: "Login Berhasil!"
          };
        }
      }
    }
    
    // 2. Cek otomatis di sheet data_guru jika tidak cocok di users
    const sheetGuru = ss.getSheetByName("data_guru");
    if (sheetGuru) {
      const dataGuru = sheetGuru.getDataRange().getValues();
      if (dataGuru.length > 1) {
        const headers = dataGuru[0];
        const idxId = headers.indexOf("id_guru");
        const idxNip = headers.indexOf("nip_nuptk");
        const idxNama = headers.indexOf("nama_guru");
        const idxPassword = headers.indexOf("password");
        
        if (idxId !== -1 && idxNama !== -1) {
          for (let i = 1; i < dataGuru.length; i++) {
            const idGuru = String(dataGuru[i][idxId]).trim();
            const nipGuru = idxNip !== -1 ? String(dataGuru[i][idxNip]).trim() : "";
            const namaGuru = String(dataGuru[i][idxNama]).trim();
            
            // Username: nama guru tanpa spasi dan lowercase
            const teacherUsername = namaGuru.replace(/\s+/g, "").toLowerCase();
            const inputUserLower = String(username).replace(/\s+/g, "").toLowerCase();
            
            const matchUser = (inputUserLower === teacherUsername);
            
            if (matchUser) {
              // Password: dari kolom password (default 'guru123')
              const inputPass = String(password).trim();
              let dbPass = "guru123";
              if (idxPassword !== -1 && String(dataGuru[i][idxPassword]).trim() !== "") {
                dbPass = String(dataGuru[i][idxPassword]).trim();
              }
              
              if (inputPass === dbPass) {
                return {
                  success: true,
                  role: "Guru",
                  target_id: idGuru,
                  username: namaGuru,
                  message: "Login Berhasil (Otomatis Guru)!"
                };
              }
            }
          }
        }
      }
    }
    
    return { success: false, message: "Kredensial Salah! Periksa username (nama guru tanpa spasi & huruf kecil) dan password Anda." };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan server: " + error.toString() };
  }
}

function ubahPasswordUser(username, passwordLama, passwordBaru) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Cek di users sheet first (admin)
    const sheetUsers = ss.getSheetByName("users");
    if (sheetUsers) {
      const data = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === username && data[i][1] === passwordLama) {
          sheetUsers.getRange(i + 1, 2).setValue(passwordBaru);
          return { success: true, message: "Password berhasil diperbarui!" };
        }
      }
    }
    
    // 2. Cek di data_guru sheet (guru)
    const sheetGuru = ss.getSheetByName("data_guru");
    if (sheetGuru) {
      const dataGuru = sheetGuru.getDataRange().getValues();
      if (dataGuru.length > 1) {
        const headers = dataGuru[0];
        const idxNama = headers.indexOf("nama_guru");
        const idxPassword = headers.indexOf("password");
        
        if (idxNama !== -1 && idxPassword !== -1) {
          for (let i = 1; i < dataGuru.length; i++) {
            const namaGuru = String(dataGuru[i][idxNama]).trim();
            const teacherUsername = namaGuru.replace(/\s+/g, "").toLowerCase();
            const inputUserLower = String(username).replace(/\s+/g, "").toLowerCase();
            
            // Match by name
            if (inputUserLower === teacherUsername || String(username).toLowerCase().trim() === namaGuru.toLowerCase()) {
              let dbPass = "guru123";
              if (String(dataGuru[i][idxPassword]).trim() !== "") {
                dbPass = String(dataGuru[i][idxPassword]).trim();
              }
              
              if (passwordLama === dbPass) {
                sheetGuru.getRange(i + 1, idxPassword + 1).setValue(passwordBaru);
                
                // Invalidate Cache
                try { CacheService.getScriptCache().remove("MASTER_DATA_Guru"); } catch(e) {}
                
                return { success: true, message: "Password guru berhasil diperbarui!" };
              }
            }
          }
        }
      }
    }
    
    return { success: false, message: "Password lama tidak sesuai / User tidak dikenali." };
  } catch (error) {
    return { success: false, message: "Gagal memproses sandi: " + error.toString() };
  }
}
