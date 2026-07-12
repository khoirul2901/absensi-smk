const fs = require('fs');
let code = fs.readFileSync('src/lib/gasApi.ts', 'utf8');

const target = `    case "getDataMaster": {
      const [kategori] = args;
      const key = kategori === "Siswa" ? "data_siswa" : "data_guru";
      return { success: true, data: getStorage(key) };
    }`;

const replacement = `    case "getDataMaster": {
      const [kategori] = args;
      const key = kategori === "Siswa" ? "data_siswa" : "data_guru";
      let data = getStorage(key);
      let changed = false;
      
      const idKey = kategori === "Siswa" ? "id_siswa" : "id_guru";
      const identifierKey = kategori === "Siswa" ? "nisn" : "nip_nuptk";
      const nameKey = kategori === "Siswa" ? "nama_siswa" : "nama_guru";
      
      data = data.map((item: any) => {
        let needsSave = false;
        if (!item[idKey]) {
          const prefix = kategori === "Siswa" ? "S-" : "G-";
          item[idKey] = prefix + new Date().getTime().toString() + Math.floor(Math.random() * 1000).toString();
          needsSave = true;
        }
        if (!item.qr_content) {
          const identifier = item[identifierKey] || "";
          const name = item[nameKey] || "";
          item.qr_content = item[idKey] + "_" + identifier + "_" + name.replace(/\\s+/g, '-');
          needsSave = true;
        }
        if (needsSave) changed = true;
        return item;
      });
      
      if (changed) {
        setStorage(key, data);
      }
      
      return { success: true, data };
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/lib/gasApi.ts', code);
