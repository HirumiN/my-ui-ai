// ============================
// STATIC DATA
// ============================
const tugasList = [
  {
    id: 1,
    title: "UTS Basis Data",
    matkul: "Praktikum Basis Data",
    deadline: "10/1/2024",
  },
  {
    id: 2,
    title: "Presentasi HCI - Usability Testing",
    matkul: "Human-Computer Interaction",
    deadline: "12/1/2024",
  },
  {
    id: 3,
    title: "Tugas Besar RPL - Aplikasi E-Learning",
    matkul: "Rekayasa Perangkat Lunak",
    deadline: "15/1/2024",
  },
];

const jadwalKuliah = [
  {
    hari: "Senin",
    list: [
      {
        title: "Rekayasa Perangkat Lunak",
        kode: "CSGE601021",
        dosen: "Dr. Ari Saptawijaya",
        lokasi: "Lab RPL",
        sks: 3,
        waktu: "08:00 - 10:30",
        type: "LECTURE",
      },
    ],
  },
  {
    hari: "Selasa",
    list: [
      {
        title: "Machine Learning",
        kode: "CSGE601022",
        dosen: "Dr. Indra Budi",
        lokasi: "Aula Fasilkom",
        sks: 3,
        waktu: "10:00 - 12:30",
        type: "LECTURE",
      },
    ],
  },
  {
    hari: "Rabu",
    list: [
      {
        title: "Praktikum Basis Data",
        kode: "CSGE601023",
        dosen: "Pak Denny",
        lokasi: "Lab Database",
        sks: 1,
        waktu: "13:00 - 16:00",
        type: "LAB",
      },
    ],
  },
];


// ============================
// COMPONENT HOME
// ============================
export default function Home() {
  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ================= LEFT — Tugas Akademik ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">📚 Tugas Akademik</h2>
            <p className="text-gray-500 text-sm">Kelola dan tambahkan tugas kuliah Anda</p>
          </div>
          <button className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            + Tugas
          </button>
        </div>

        {tugasList.map((tugas) => (
          <div key={tugas.id} className="border rounded-lg p-4 mb-3">
            <h3 className="font-semibold">{tugas.title}</h3>
            <p className="text-sm text-gray-600">{tugas.matkul}</p>
            <p className="text-xs text-gray-500">Deadline: {tugas.deadline}</p>

            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 border rounded-lg text-sm">✏️ Edit</button>
              <button className="px-3 py-1 border rounded-lg text-sm bg-gray-100">✔ Selesai</button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= RIGHT — Jadwal Kuliah ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">📅 Jadwal Kuliah</h2>
            <p className="text-gray-500 text-sm">Pilih tampilan hari ini atau mingguan</p>
          </div>
          <button className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            + Jadwal
          </button>
        </div>

        <div className="flex bg-gray-100 rounded-lg overflow-hidden mb-4">
          <button className="w-1/2 py-2 bg-white font-medium">Hari Ini</button>
          <button className="w-1/2 py-2 text-gray-500">Mingguan</button>
        </div>

        {jadwalKuliah.map((hari) => (
          <div key={hari.hari} className="mb-4">
            <h3 className="font-semibold mb-2">📅 {hari.hari}</h3>

            {hari.list.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 mb-3"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">
                  {item.kode} • {item.dosen}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.type} • {item.lokasi} • {item.sks} SKS
                </p>
                <p className="text-xs text-gray-500">{item.waktu}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}
